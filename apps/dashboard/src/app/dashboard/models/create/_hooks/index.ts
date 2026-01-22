// Re-export old hook for backwards compatibility
export type { UseModelFormOptions, UseModelFormReturn } from './use-model-form'
export { useModelForm } from './use-model-form'

// Re-export new wizard hook
export type { UseModelWizardReturn } from './use-model-wizard'
export { useModelWizard } from './use-model-wizard'

// Common exports (use wizard version as canonical)
export type { ReferenceImage, Step } from './use-model-wizard'
