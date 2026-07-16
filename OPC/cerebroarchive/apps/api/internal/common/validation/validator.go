package validation

import (
	"github.com/go-playground/validator/v10"
)

type Validator struct {
	validate *validator.Validate
}

func New() *Validator {
	return &Validator{
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// ValidateStruct attempts to validate a DTO and returns a map of field errors if any fail.
func (v *Validator) ValidateStruct(s interface{}) map[string]string {
	err := v.validate.Struct(s)
	if err == nil {
		return nil
	}

	errors := make(map[string]string)
	for _, err := range err.(validator.ValidationErrors) {
		// In a real application, you'd map tags to human readable messages here.
		errors[err.Field()] = "failed validation on tag: " + err.Tag()
	}
	return errors
}
