import type {
  CrmJsonReportResponse,
  CrmReportFormat,
} from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmJsonReportResponse | string> => {
  const format = (getQuery(event).format as string | undefined)?.toLowerCase() as
    | CrmReportFormat
    | undefined

  if (!format || !['json', 'csv', 'pdf'].includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported report format "${format ?? ''}".`,
      data: {
        supportedFormats: ['json', 'csv', 'pdf'],
      },
    })
  }

  const report = await cachedCrmGeneralGet<CrmJsonReportResponse | string>(event, 'reports', {
    format,
  })

  if (format === 'csv') {
    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  }

  if (format === 'pdf') {
    setHeader(event, 'content-type', 'application/pdf')
  }

  return report
})
