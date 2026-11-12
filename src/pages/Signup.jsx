import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { safeNext } from '../lib/routes.js'
import { btnInk, inputClass } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

function fieldErrors(values, users) {
  const errors = {}
  if (values.name.trim().length < 2) errors.name = 'Enter the name you want on the desk (at least 2 characters).'
  const email = values.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  else if (users.some((account) => account.email === email)) errors.email = 'That email already holds a paper account.'
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(values.password)) {
    errors.password = 'Use at least 8 characters, including a letter and a number.'
  }
  if (!values.confirm) errors.confirm = 'Confirm your password.'
  else if (values.confirm !== values.password) errors.confirm = 'Those passwords do not match.'
  return errors
}

const EMPTY = { name: '', email: '', password: '', confirm: '' }

export default function Signup() {
  const { user, users, signup, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  usePageTitle('Sign up')

  const errors = fieldErrors(values, users)
  const visible = (field) => (submitted || touched[field]) && errors[field]

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }

  function onSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    const nextErrors = fieldErrors(values, users)
    const first = ['name', 'email', 'password', 'confirm'].find((field) => nextErrors[field])
    if (first) {
      document.getElementById(`signup-${first}`)?.focus()
      return
    }
    const result = signup(values)
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    navigate(safeNext(location.state?.from))
  }

  if (user) {
    return (
      <AuthShell
        title="The desk already has your name."
        lede={`Signed in as ${user.name}.`}
        footer={
          <button type="button" className="underline-offset-2 hover:underline" onClick={logout}>
            Sign out
          </button>
        }
      >
        <Link to="/markets" className={btnInk}>
          Go to the dashboard
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Sign up"
      lede="Open a paper account. It lives only in this browser, with $100,000 of imaginary cash."
      footer={
        <>
          Already have a desk?{' '}
          <Link to="/login" state={location.state} className="font-medium text-brass underline-offset-2 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? (
          <p role="alert" className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">
            {formError}
          </p>
        ) : null}
        <Field id="signup-name" label="Name" error={visible('name')}>
          <input
            id="signup-name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            aria-invalid={visible('name') ? 'true' : 'false'}
            aria-describedby={visible('name') ? 'signup-name-error' : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="signup-email" label="Email" error={visible('email')}>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            aria-invalid={visible('email') ? 'true' : 'false'}
            aria-describedby={visible('email') ? 'signup-email-error' : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="signup-password" label="Password" hint="At least 8 characters, with a letter and a number." error={visible('password')}>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => update('password', event.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              aria-invalid={visible('password') ? 'true' : 'false'}
              aria-describedby={visible('password') ? 'signup-password-error' : 'signup-password-hint'}
              className={`${inputClass} pr-16`}
            />
            <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-mist" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>
        <Field id="signup-confirm" label="Confirm password" error={visible('confirm')}>
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={values.confirm}
            onChange={(event) => update('confirm', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
            aria-invalid={visible('confirm') ? 'true' : 'false'}
            aria-describedby={visible('confirm') ? 'signup-confirm-error' : undefined}
            className={inputClass}
          />
        </Field>
        <p className="text-sm leading-6 text-mist">Use a made-up password. Haldenwick stores it in this browser so login can work. Do not reuse a real one.</p>
        <button type="submit" className={btnInk}>
          Sign up
        </button>
      </form>
    </AuthShell>
  )
}
