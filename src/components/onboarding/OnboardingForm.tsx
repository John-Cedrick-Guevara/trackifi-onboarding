import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Shield } from "lucide-react";
import { ProgressStepper } from "./ProgressStepper";
import { StepCredentials } from "./StepCredentials";
import { StepIncomeSource } from "./StepIncomeSource";
import { StepFinancialGoals } from "./StepFinancialGoals";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Credentials", description: "Create your secure account" },
  { id: 2, title: "Income", description: "Tell us about your income" },
  { id: 3, title: "Goals", description: "Set your first financial goal" },
];

interface FormData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  // Step 2
  occupation: string;
  incomeSource: string;
  // Step 3
  goalType: string;
  targetAmount: string;
  startDate: string;
  endDate: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  contactNumber: "",
  occupation: "",
  incomeSource: "",
  goalType: "",
  targetAmount: "",
  startDate: "",
  endDate: "",
};

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors = Object.keys(updates).reduce((acc, key) => {
      acc[key as keyof FormData] = undefined;
      return acc;
    }, {} as FormErrors);
    setErrors((prev) => ({ ...prev, ...clearedErrors }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    if (step === 2) {
      if (!formData.occupation.trim()) newErrors.occupation = "Please enter your occupation";
      if (!formData.incomeSource) newErrors.incomeSource = "Please select your income source";
    }

    if (step === 3) {
      if (!formData.goalType) newErrors.goalType = "Please select a goal type";
      if (!formData.targetAmount) newErrors.targetAmount = "Please enter a target amount";
      if (!formData.startDate) newErrors.startDate = "Please select a start date";
      if (!formData.endDate) {
        newErrors.endDate = "Please select a target date";
      } else if (formData.startDate && formData.endDate < formData.startDate) {
        newErrors.endDate = "Target date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create metadata object (abstracted from user)
    const metadata = {
      goalType: formData.goalType,
      targetAmount: parseInt(formData.targetAmount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdAt: new Date().toISOString(),
    };

    console.log("Form submitted:", { ...formData, metadata });

    setIsSubmitting(false);
    setIsComplete(true);

    toast({
      title: "Welcome to TrackiFi!",
      description: "Your account has been created successfully.",
    });
  }, [currentStep, formData, validateStep, toast]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-secondary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-foreground mb-2"
        >
          You're all set!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          Welcome to TrackiFi, {formData.firstName}. Your financial journey starts now.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => {
              setIsComplete(false);
              setCurrentStep(1);
              setFormData(initialFormData);
            }}
            className="btn-primary-finance px-8 py-3 rounded-xl"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Stepper */}
      <ProgressStepper steps={steps} currentStep={currentStep} />

      {/* Form Steps */}
      <div className="min-h-[460px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepCredentials
              key="credentials"
              data={{
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                contactNumber: formData.contactNumber,
              }}
              onChange={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <StepIncomeSource
              key="income"
              data={{
                occupation: formData.occupation,
                incomeSource: formData.incomeSource,
              }}
              onChange={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <StepFinancialGoals
              key="goals"
              data={{
                goalType: formData.goalType,
                targetAmount: formData.targetAmount,
                startDate: formData.startDate,
                endDate: formData.endDate,
              }}
              onChange={updateFormData}
              errors={errors}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between pt-8 border-t border-border mt-8"
      >
        {/* Back button */}
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="btn-secondary-finance gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        {/* Next / Submit button */}
        <Button
          type="button"
          onClick={currentStep === steps.length ? handleSubmit : handleNext}
          disabled={isSubmitting}
          className="btn-primary-finance gap-2 px-6 py-3 rounded-xl"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
              Creating account...
            </>
          ) : currentStep === steps.length ? (
            <>
              Complete Setup
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Your data is encrypted and secure</span>
      </motion.div>
    </div>
  );
}
