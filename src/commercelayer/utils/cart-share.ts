import { resolveFontGroups } from '@/commercelayer/providers/buy/resolve-font-groups'
import type {
  GroupResolutions,
  LicenseSize,
  ResolvedFontGroup,
  SelectionBuffer,
  StyleEntry,
} from '@/commercelayer/providers/order/types'
import type { CompanySize, MediaType } from '@/sanity/lib/queries'
import { z } from 'zod'

/**
 * Cart share tokens
 * -----------------
 * A share token is a stateless, unsigned, compact description of a cart's
 * *selections* (not of a Commerce Layer order). It is resolved server-side
 * against Sanity, which re-derives every display field, so a tampered token
 * can only ever yield a cart of valid fonts.
 *
 * Per font, the selection is a bitmask over the font's canonical style order
 * (the flattened, de-duplicated `includedSkuCodes` order from
 * `resolveFontGroups`). A short fingerprint of that order lets the resolver
 * detect that the font's variants/groups changed in Sanity since the link was
 * made, in which case the font is skipped.
 */

/** Soft cap on the encoded token length (characters) */
export const CART_SHARE_MAX_TOKEN_LENGTH = 2000
/** Hard cap on what the decoder will even attempt to parse */
const MAX_DECODE_LENGTH = 8000

const shareFontSchema = z.object({
  /** Font uid */
  u: z.string().min(1),
  /** Fingerprint of the canonical style order (present with `m`) */
  f: z.string().optional(),
  /** Selection bitmask over the canonical order, hex (bit 0 = first style) */
  m: z
    .string()
    .regex(/^[0-9a-f]*$/)
    .optional(),
  /** Extra raw variant ids not covered by the mask */
  i: z.array(z.string()).optional(),
  /** License type refs, when different from the token default */
  t: z.array(z.string()).optional(),
  /** Per-style license type overrides keyed by canonical index */
  o: z.record(z.array(z.string())).optional(),
})

const shareTokenSchema = z.object({
  v: z.literal(1),
  /** License size `value` */
  s: z.string().optional(),
  /** Default license type refs */
  t: z.array(z.string()).optional(),
  f: z.array(shareFontSchema).min(1),
})

export type CartShareFont = z.infer<typeof shareFontSchema>
export type CartShareToken = z.infer<typeof shareTokenSchema>

/** What the clone landing page hands to the client-side importer */
export interface ClonePayload {
  selections: SelectionBuffer
  groupResolutions: GroupResolutions
  licenseSize?: LicenseSize
  /** Default (order-wide) license type refs */
  defaultLicenseTypes: string[]
  /** Names/uids of fonts that were skipped (unknown or out of date) */
  skippedFonts: string[]
}

// ── helpers ────────────────────────────────────────────────────────────────

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** 32-bit FNV-1a, base36 */
function hash(value: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

/** Flattened, de-duplicated style order across a font's resolved groups */
export function canonicalStyleOrder(groups: ResolvedFontGroup[]): string[] {
  const seen = new Set<string>()
  const order: string[] = []
  for (const group of groups) {
    for (const id of group.includedSkuCodes) {
      if (!seen.has(id)) {
        seen.add(id)
        order.push(id)
      }
    }
  }
  return order
}

/** Short hash of a font's ordered style ids + group names */
export function computeFontFingerprint(
  orderedIds: string[],
  groups: ResolvedFontGroup[]
): string {
  return hash(
    `${orderedIds.join(',')}|${groups.map((g) => g.groupName).join(',')}`
  )
}

function bitsToHex(bits: boolean[]): string {
  let hex = ''
  for (let i = 0; i < bits.length; i += 4) {
    let nibble = 0
    for (let b = 0; b < 4; b++) {
      if (bits[i + b]) nibble |= 1 << b
    }
    hex += nibble.toString(16)
  }
  return hex
}

function hexToBits(hex: string, length: number): boolean[] {
  const bits: boolean[] = []
  for (let i = 0; i < length; i++) {
    const nibble = parseInt(hex[Math.floor(i / 4)] ?? '0', 16)
    bits.push(!!(nibble & (1 << (i % 4))))
  }
  return bits
}

const sameTypes = (a: string[] = [], b: string[] = []) =>
  a.length === b.length && a.every((ref, i) => ref === b[i])

// ── encode ─────────────────────────────────────────────────────────────────

export type EncodeCartShareResult =
  { ok: true; token: string } | { ok: false; reason: 'empty' | 'too-large' }

export function encodeCartShare(
  selections: SelectionBuffer,
  groupResolutions: GroupResolutions,
  licenseSize?: LicenseSize
): EncodeCartShareResult {
  const uids = Object.keys(selections).filter(
    (uid) => Object.keys(selections[uid]).length > 0
  )
  if (uids.length === 0) return { ok: false, reason: 'empty' }

  const firstEntry = Object.values(selections[uids[0]])[0]
  const defaultTypes = firstEntry?.licenseTypes ?? []

  const fonts: CartShareFont[] = uids.map((uid) => {
    const group = selections[uid]
    const skuCodes = Object.keys(group)
    const entry: CartShareFont = { u: uid }

    const groups = groupResolutions[uid] ?? []
    const order = canonicalStyleOrder(groups)
    const indexOf = new Map(order.map((id, i) => [id, i]))

    // Font-level types: the first selected style's, only when they differ
    // from the token default.
    const fontTypes = group[skuCodes[0]]?.licenseTypes ?? []
    if (!sameTypes(fontTypes, defaultTypes)) entry.t = fontTypes
    const effectiveFontTypes = entry.t ?? defaultTypes

    if (order.length > 0) {
      const bits = order.map(() => false)
      const extras: string[] = []
      const overrides: Record<string, string[]> = {}
      for (const code of skuCodes) {
        const idx = indexOf.get(code)
        if (idx === undefined) {
          extras.push(code)
          continue
        }
        bits[idx] = true
        const types = group[code].licenseTypes ?? []
        if (!sameTypes(types, effectiveFontTypes)) overrides[idx] = types
      }
      entry.f = computeFontFingerprint(order, groups)
      entry.m = bitsToHex(bits)
      if (extras.length) entry.i = extras
      if (Object.keys(overrides).length) entry.o = overrides
    } else {
      // No resolutions registered for this font: fall back to raw ids
      entry.i = skuCodes
    }
    return entry
  })

  const payload: CartShareToken = {
    v: 1,
    ...(licenseSize?.value ? { s: licenseSize.value } : {}),
    ...(defaultTypes.length ? { t: defaultTypes } : {}),
    f: fonts,
  }

  const token = toBase64Url(JSON.stringify(payload))
  if (token.length > CART_SHARE_MAX_TOKEN_LENGTH) {
    return { ok: false, reason: 'too-large' }
  }
  return { ok: true, token }
}

export function buildCartShareUrl(origin: string, token: string): string {
  return `${origin}/cart/clone/${token}`
}

// ── decode ─────────────────────────────────────────────────────────────────

export function decodeCartShare(token: string): CartShareToken | null {
  if (!token || token.length > MAX_DECODE_LENGTH) return null
  try {
    const parsed = shareTokenSchema.safeParse(
      JSON.parse(fromBase64Url(token))
    )
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

// ── expand (server side) ───────────────────────────────────────────────────

type VariantRef = { _id: string; optionName?: string | null } | null

/** Structural shape of the clone query result for a font */
export interface CloneFont {
  _id: string
  uid?: string | null
  name?: string | null
  shortName?: string | null
  variants?: VariantRef[] | null
  defaultVariant?: { _id: string } | null
  styleGroups?:
    | {
        groupName?: string | null
        variants?: VariantRef[] | null
        italicVariants?: VariantRef[] | null
      }[]
    | null
}

export function expandCartShare(
  token: CartShareToken,
  fonts: CloneFont[],
  sizes: CompanySize[],
  media: MediaType[]
): ClonePayload {
  const byUid = new Map(fonts.flatMap((f) => (f.uid ? [[f.uid, f]] : [])))
  const knownTypeRefs = new Set(media.map((m) => m._key))
  const cleanTypes = (refs: string[] | undefined): string[] =>
    (refs ?? []).filter((ref) => knownTypeRefs.has(ref))

  const defaultLicenseTypes = cleanTypes(token.t)
  const selections: SelectionBuffer = {}
  const groupResolutions: GroupResolutions = {}
  const skippedFonts: string[] = []

  for (const entry of token.f) {
    const font = byUid.get(entry.u)
    if (!font) {
      skippedFonts.push(entry.u)
      continue
    }
    const fontName = font.shortName ?? font.name ?? entry.u

    const groups = resolveFontGroups(font)
    const order = canonicalStyleOrder(groups)

    const optionNames = new Map<string, string>()
    const register = (v: VariantRef) => {
      if (v?._id) optionNames.set(v._id, v.optionName ?? '')
    }
    font.variants?.forEach(register)
    font.styleGroups?.forEach((g) => {
      g.variants?.forEach(register)
      g.italicVariants?.forEach(register)
    })

    // Selected ids (with their canonical index when known)
    const selected: { id: string; index?: number }[] = []
    if (entry.m !== undefined) {
      if (entry.f !== computeFontFingerprint(order, groups)) {
        skippedFonts.push(fontName)
        continue
      }
      hexToBits(entry.m, order.length).forEach((on, index) => {
        if (on) selected.push({ id: order[index], index })
      })
    }
    for (const id of entry.i ?? []) {
      if (optionNames.has(id) && !selected.some((s) => s.id === id)) {
        selected.push({ id })
      }
    }
    if (selected.length === 0) {
      skippedFonts.push(fontName)
      continue
    }

    const fontTypes = entry.t ? cleanTypes(entry.t) : defaultLicenseTypes
    const group: { [skuCode: string]: StyleEntry } = {}
    for (const { id, index } of selected) {
      const override = index !== undefined ? entry.o?.[index] : undefined
      group[id] = {
        licenseTypes: override ? cleanTypes(override) : fontTypes,
        parentName: fontName,
        name: `${fontName} ${optionNames.get(id) ?? ''}`.trim(),
        className: id,
        defaultVariantId: font.defaultVariant?._id ?? '',
      }
    }
    selections[entry.u] = group
    if (groups.length > 0) groupResolutions[entry.u] = groups
  }

  const size = token.s ? sizes.find((s) => s.value === token.s) : undefined

  return {
    selections,
    groupResolutions,
    licenseSize: size
      ? { label: size.label, value: size.value, modifier: size.modifier }
      : undefined,
    defaultLicenseTypes,
    skippedFonts,
  }
}
