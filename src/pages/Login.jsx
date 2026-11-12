import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { safeNext } from '../lib/routes.js'
import { btnInk, inputClass } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

function fieldErrors(values) {
  const errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter the email on your paper account.'
  if (!values.password) errors.password = 'Enter your password.'
  return errors
}

export default function Login() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  usePageTitle('Login')

  const errors = fieldErrors(values)
  const visible = (field) => (submitted || touched[field]) && errors[field]

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }

  function onSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    const nextErrors = fieldErrors(values)
    const first = ['email', 'password'].find((field) => nextErrors[field])
    if (first) {
      document.getElementById(`login-${first}`)?.focus()
      return
    }
    const result = login(values)
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    navigate(safeNext(location.state?.from))
  }

  if (user) {
    return (
      <AuthShell
        title="You are already at the desk."
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
      title="Login"
      lede="Return to the paper desk you opened in this browser."
      footer={
        <>
          New to the house?{' '}
          <Link to="/signup" state={location.state} className="font-medium text-brass underline-offset-2 hover:underline">
            Sign up
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
        <Field id="login-email" label="Email" error={visible('email')}>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            aria-invalid={visible('email') ? 'true' : 'false'}
            aria-describedby={visible('email') ? 'login-email-error' : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="login-password" label="Password" error={visible('password')}>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={(event) => update('password', event.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              aria-invalid={visible('password') ? 'true' : 'false'}
              aria-describedby={visible('password') ? 'login-password-error' : undefined}
              className={`${inputClass} pr-16`}
            />
            <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-mist" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>
        <p className="text-sm text-mist">Use the made-up password from signup. This demo keeps it in the browser so you can return.</p>
        <button type="submit" className={btnInk}>
          Login
        </button>
      </form>
    </AuthShell>
  )
}
