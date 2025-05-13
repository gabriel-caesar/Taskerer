import { beforeEach, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react'; // (@) defines a scope of testing libraries which react is one of then
import userEvent from '@testing-library/user-event';
// import SignUpForm from '../components/SignUpForm';
import Navbar from '../components/Navbar';

describe('SignUpForm.jsx', () => {

  const user = userEvent.setup();

  let signUpInButton;

  beforeEach(() => {
    render(<Navbar />);
    signUpInButton = screen.getByRole('button', {name: /sign up\/in/i});
  })

  test('Does Sign Up/In form appears?', async () => {
    await user.click(signUpInButton);

    const form = screen.getByRole('form', {name: /signupform/i});

    screen.debug();

    expect(form).toBeInTheDocument();
  });
});