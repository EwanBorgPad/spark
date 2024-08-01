import { useEffect } from "react"
import { UseFormSetValue } from "react-hook-form"

type FormMethods = {
  formValues: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  isSubmitted: boolean
}

export const useFormDraft = (
  formName: string,
  { formValues, setValue, isSubmitted }: FormMethods,
  isEnabled: boolean = true,
) => {
  useEffect(() => {
    if (isEnabled) {
      const formData = sessionStorage.getItem(formName)
      if (formData) {
        Object.entries(JSON.parse(formData)).forEach(([key, value]) => {
          setValue(key, value)
        })
      }
    }
  }, [formName, setValue, isEnabled])

  useEffect(() => {
    if (isEnabled) {
      sessionStorage.setItem(formName, JSON.stringify(formValues))
      if (isSubmitted) {
        // @TODO - commented for testing, to be uncommented when seen
        // sessionStorage.removeItem(formName)
      }
    }
  }, [formName, formValues, isSubmitted, isEnabled])
}
