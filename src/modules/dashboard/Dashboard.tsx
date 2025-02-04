import Button from '../shared/components/Button/Button'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useState } from 'react'
import { Form, Input, DatePicker, message } from 'antd'

const Dashboard = () => {
  const [accessToken, setAccessToken] = useState(null)
  const [form] = Form.useForm()

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (tokenResponse: any) => {
      setAccessToken(tokenResponse.access_token)
    },
    onError: () => alert('Google Sign-In Failed'),
  })

  const createEvent = async (values: any) => {
    if (!accessToken) {
      try {
        const response: any = await login()
        setAccessToken(response.access_token)
      } catch (error) {
        message.error('Google Sign-In Failed')
        return
      }
    }

    const {
      summary,
      description,
      startTime,
      endTime,
      attendees,
    }: { summary: string; description: string; startTime: any; endTime: any; attendees: string } =
      values

    const eventDetails = {
      summary: summary || 'Team Meeting',
      description: description || 'Discuss project updates',
      start: { dateTime: startTime.format(), timeZone: 'UTC' },
      end: { dateTime: endTime.format(), timeZone: 'UTC' },
      attendees: attendees.split(',').map((email: string) => ({ email: email.trim() })),
    }

    try {
      await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        eventDetails,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      message.success('Event Created!')
    } catch (error) {
      console.error(error)
      message.error('Failed to create event.')
    }
  }

  const onFinish = (values: any) => {
    createEvent(values)
  }

  return (
    <div className="dashboard-page">
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="summary" label="Meeting Summary">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input />
        </Form.Item>
        <Form.Item
          name="startTime"
          label="Start Time"
          rules={[{ required: true, message: 'Please select start time!' }]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          name="endTime"
          label="End Time"
          rules={[{ required: true, message: 'Please select end time!' }]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item name="attendees" label="Attendees (comma separated)">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="submit">Schedule Meet</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Dashboard
