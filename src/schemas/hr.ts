import * as yup from 'yup';

export const leaveRequestSchema = yup.object({
  leaveType: yup
    .string()
    .required('Please select a leave type'),
  startDate: yup
    .string()
    .required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required'),
  reason: yup
    .string()
    .required('Reason is required')
    .min(10, 'Please provide more details'),
});

export type LeaveRequestFormData = yup.InferType<typeof leaveRequestSchema>;
