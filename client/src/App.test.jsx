import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('App', () => {
  it('renders and increments the counter', async () => {
    const user = userEvent.setup()

    render(<App />)

    const button = screen.getByRole('button', { name: /count is 0/i })

    await user.click(button)

    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
  })
})