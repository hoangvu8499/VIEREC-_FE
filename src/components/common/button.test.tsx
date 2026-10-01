import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '@/components/common/button'

describe('Button', () => {
  it('renders and handles click', async () => {
    const onClick = vi.fn<() => void>()
    render(<Button onClick={onClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Click me' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('defaults to type="button"', () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('applies variant and size classes', () => {
    render(
      <Button variant="accent" size="lg" className="extra">
        Go
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Go' })
    expect(button.className).toMatch(/accent/)
    expect(button.className).toMatch(/lg/)
    expect(button).toHaveClass('extra')
  })

  it('disables itself while loading', () => {
    render(<Button loading>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
