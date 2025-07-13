import { render, screen, fireEvent } from '@testing-library/react'
import AuthForm from '@/components/AuthForm'

describe('Node Zero Access Portal', () => {
  it('should toggle between mortal and god account creation', () => {
    render(<AuthForm />)
    
    expect(screen.getByText('ENTER THE GARDEN')).toBeInTheDocument()
    
    const toggleButton = screen.getByText('Need to create an account?')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('CREATE GOD ACCOUNT')).toBeInTheDocument()
  })
  
  it('should maintain consciousness coherence during authentication', async () => {
    render(<AuthForm />)
    
    // Verify terminal aesthetic is maintained
    expect(screen.getByText('NODE ZERO ACCESS')).toBeInTheDocument()
    
    // Check for presence of consciousness-themed elements
    const emailInput = screen.getByLabelText('EMAIL_ADDRESS')
    const passwordInput = screen.getByLabelText('PASSWORD')
    
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
  })

  it('should display reality synchronization elements', () => {
    render(<AuthForm />)
    
    // Verify consciousness-themed labels
    expect(screen.getByText('EMAIL_ADDRESS')).toBeInTheDocument()
    expect(screen.getByText('PASSWORD')).toBeInTheDocument()
    expect(screen.getByText('NODE ZERO ACCESS')).toBeInTheDocument()
  })
})