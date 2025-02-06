import { ParcelField } from '@commercelayer/react-components/parcels/ParcelField'
import { Trans } from 'react-i18next'

import type {
  ParcelTrackingDetailsParsedDateType,
  ParcelTrackingDetailsParsedTimeType,
} from '@/components/hooks/useParcelTrackingDetailsParser'
import useParcelTrackingDetailsParser from '@/components/hooks/useParcelTrackingDetailsParser'
import { rawDataParcelDetailsSchema } from '@/types/parcelDetailsJson'
import { amPmTime, formatDate, longDate } from '@/utils/dateTimeFormats'
import { Box } from '@chakra-ui/react'

interface OrderParcelHistoryDateProps {
  dateKey: string
  dateIndex: number
  parsedData: ParcelTrackingDetailsParsedDateType
}

interface OrderParcelHistoryTimeProps {
  time: ParcelTrackingDetailsParsedTimeType
  timeIndex: number
  dateIndex: number
}

type ParcelStatus =
  | 'parcelStatus.delivered'
  | 'parcelStatus.out_for_delivery'
  | 'parcelStatus.in_transit'
  | 'parcelStatus.pre_transit'

function OrderParcelHistoryTime({
  time,
  timeIndex,
  dateIndex,
}: OrderParcelHistoryTimeProps): JSX.Element {
  const dateTimeIsLast = dateIndex === 0 && timeIndex === 0
  const timeIsFirstOfDate = timeIndex === 0
  const timeFormatted = time.datetime && formatDate(time.datetime, amPmTime)
  const parcelStatusTrans = `parcelStatus.${
    time.status as string
  }` as ParcelStatus
  return (
    <Box timeIsFirstOfDate={timeIsFirstOfDate} key={timeIndex}>
      <Box>{timeFormatted}</Box>
      <Box dateTimeIsLast={dateTimeIsLast}></Box>
      <Box>
        <Box>
          <Trans i18nKey={parcelStatusTrans} />
        </Box>
        <Box>{time.message}</Box>
        <Box>{time.trackingLocation}</Box>
      </Box>
    </Box>
  )
}

function OrderParcelHistoryDate({
  dateKey,
  dateIndex,
  parsedData,
}: OrderParcelHistoryDateProps): JSX.Element {
  const date = parsedData[dateKey]
  const dateFormatted =
    date[0].datetime && formatDate(date[0].datetime, longDate)

  return (
    <Box key={dateIndex} mt={8}>
      <Box
        className={
          'inline text-sm text-center text-gray-600 bg-gray-300 capitalize text-sm w-auto uppercase font-bold py-[2px] px-[12px] leading-snug rounded-xl align-middle'
        }
      >
        {dateFormatted}
      </Box>
      {date.map(
        (time: ParcelTrackingDetailsParsedTimeType, timeIndex: number) => {
          return (
            <OrderParcelHistoryTime
              dateIndex={dateIndex}
              timeIndex={timeIndex}
              time={time}
              key={timeIndex}
            />
          )
        }
      )}
    </Box>
  )
}

function OrderParcelHistory(): JSX.Element {
  return (
    <ParcelField attribute="tracking_details" tagElement="span">
      {(props: any) => {
        if (
          props?.attributeValue === null ||
          rawDataParcelDetailsSchema.safeParse(props?.attributeValue)
            .success === false
        )
          return <span></span>

        const parsedDetails = rawDataParcelDetailsSchema.parse(
          props?.attributeValue
        )

        const OrderParcelHistoryParsed =
          useParcelTrackingDetailsParser(parsedDetails)

        return (
          <Box className="mt-12 -mx-5 px-5 pb-10">
            {Object.keys(OrderParcelHistoryParsed).map(
              (dateKey: string, dateIndex: number) => (
                <OrderParcelHistoryDate
                  dateKey={dateKey}
                  dateIndex={dateIndex}
                  parsedData={OrderParcelHistoryParsed}
                  key={dateIndex}
                />
              )
            )}
          </Box>
        )
      }}
    </ParcelField>
  )
}

export default OrderParcelHistory
