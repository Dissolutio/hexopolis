import { useTimeout } from 'hooks/useTimeout'
import React, { useState } from 'react'

function isValidInput(string_: string): boolean {
  return Math.random() > 0.5
}

export const TimeoutErrorMessageExample = () => {
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [delayToDismissError, setDelayToDismissError] = useState<number | null>(
    null
  )
  const dismissError = () => {
    setErrorMessage('')
    setDelayToDismissError(null)
  }
  useTimeout(dismissError, delayToDismissError)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (!isValidInput(newValue)) {
      setErrorMessage(
        `You entered an invalid character: "${newValue[newValue.length - 1]}"`
      )
      setDelayToDismissError(3000)
      return
    }
    dismissError()
    setInputValue(newValue)
  }

  return (
    <div>
      <label>
        Input:
        <input type="text" value={inputValue} onChange={handleChange} />
      </label>
      <span style={{ color: 'red' }}>Error: {errorMessage}</span>
    </div>
  )
}
