import { useState } from 'react';
import Form from '../../../shared/components/Form';
import type { Field } from '../../../shared/components/Form';
import SectionContainer from '../../../shared/section-container/SectionContainer';
import MainContainer from '../../../shared/main-container/MainContainer';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Validation function
  const validateIdentifier = (value: string): string | null => {
    if (!value) return 'Identifier is required';
    
    // Email regex (simple but effective)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) return null;
    
    // Phone validation: remove all non‑digit characters (e.g., spaces, dashes, parentheses)
    const digitsOnly = value.replace(/\D/g, '');
    
    // Bangladeshi mobile number formats:
    // - 11 digits starting with 01 and third digit 3–9: 01[3-9]XXXXXXXX
    // - 13 digits starting with 8801 and the next digit 3–9: 8801[3-9]XXXXXXXX
    const bdPhoneRegex = /^(01[3-9]\d{8})$|^(8801[3-9]\d{8})$/;
    
    if (bdPhoneRegex.test(digitsOnly)) return null;
    
    return 'Enter a valid email or Bangladeshi phone number';
  };

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate identifier before submitting
    const identifierError = validateIdentifier(values.identifier);
    if (identifierError) {
      setErrors({ identifier: identifierError });
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    console.log(values);
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 2000);
  };

  const fields: Field[] = [
    { 
      name: 'identifier', 
      label: 'Email or Phone', 
      type: 'text', 
      required: true, 
      placeholder: 'your@email.com or 017XXXXXXXX' 
    },
    { 
      name: 'password', 
      label: 'Password', 
      type: 'password', 
      required: true, 
      placeholder: '••••••••' 
    },
  ];

  return (
    <SectionContainer>
      <MainContainer>
        <div className="max-w-md mx-auto bg-white rounded-xs shadow-lg p-8">
          <h2 className="font-serif text-2xl font-bold text-center mb-6">Sign In</h2>
          <Form
            fields={fields}
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            errors={errors}
            submitText="Login"
            loading={loading}
            footer={
              <p className="text-center text-sm">
                Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
              </p>
            }
          />
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default LoginPage;