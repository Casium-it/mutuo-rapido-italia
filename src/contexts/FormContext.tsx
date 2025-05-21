
// This file now serves as a re-export of the modular form context
// for backwards compatibility with components using the old import path
import { 
  FormProvider, 
  FormContext, 
  useForm,
  useFormState,
  useFormNavigation,
  useFormResponses,
  useFormBlocks,
  useFormDynamicBlocks
} from './FormContext/index';

export { 
  FormProvider, 
  FormContext,
  useForm,
  useFormState,
  useFormNavigation,
  useFormResponses,
  useFormBlocks,
  useFormDynamicBlocks
};

export default useForm;
