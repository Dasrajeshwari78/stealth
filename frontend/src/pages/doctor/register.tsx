import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Stepper, { Step } from "@/components/Stepper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, XCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface DoctorData {
  email: string;
  name: string;
  specialty: string;
  years_of_experience: number;
  organisation: string;
  phone: string;
  password: string;
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<DoctorData>({
    email: "crypto.email.rph@gmail.com",
    name: "Arnab",
    specialty: "",
    years_of_experience: 0,
    organisation: "",
    phone: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Activation token is missing");
        setIsValidating(false);
        toast.error("Activation token is missing");
        return;
      }

      try {
        const response = await fetch(
          `${SERVER_URL}/api/auth/validate-activation-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsValidToken(true);
          // Pre-fill email and name from token validation
          setFormData((prev) => ({
            ...prev,
            email: data.email || "",
            name: data.name || "",
          }));
          toast.success("Token validated successfully!");
        } else {
          const data = await response.json();
          const errorMessage =
            data.message || "Invalid or expired activation token";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          "Failed to validate token. Please check your connection.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Token validation error:", err);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Step 1 validation - Name and Email are pre-filled, so always valid
  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return false;
    }
    return true;
  };

  // Step 2 validation - Professional Information
  const validateStep2 = () => {
    if (!formData.specialty || !formData.specialty.trim()) {
      toast.error("Please enter your specialty");
      return false;
    }
    if (formData.specialty.trim().length < 2) {
      toast.error("Specialty must be at least 2 characters long");
      return false;
    }
    if (
      formData.years_of_experience === null ||
      formData.years_of_experience === undefined ||
      isNaN(formData.years_of_experience)
    ) {
      toast.error("Please enter years of experience");
      return false;
    }
    if (
      formData.years_of_experience == 0 ||
      formData.years_of_experience > 60
    ) {
      toast.error("Years of experience must be between 0 and 60");
      return false;
    }
    return true;
  };

  // Step 3 validation - Contact Details
  const validateStep3 = () => {
    if (!formData.organisation || !formData.organisation.trim()) {
      toast.error("Please enter your organisation");
      return false;
    }
    if (formData.organisation.trim().length < 2) {
      toast.error("Organisation name must be at least 2 characters long");
      return false;
    }
    if (!formData.phone || !formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return false;
    }
    if (!/^\+?[\d\s-]+$/.test(formData.phone)) {
      toast.error(
        "Please enter a valid phone number (digits, spaces, hyphens, and + allowed)"
      );
      return false;
    }
    return true;
  };

  // Step 4 validation - Security
  const validateStep4 = () => {
    if (!formData.password || formData.password.trim() === "") {
      toast.error("Please enter a password");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (!confirmPassword || confirmPassword.trim() === "") {
      toast.error("Please confirm your password");
      return false;
    }
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!agreeTerms) {
      toast.error("Please agree that all data is valid");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep4()) {
      return false;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Registering your account...");

    try {
      const response = await fetch(`${SERVER_URL}/api/auth/register-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          token,
        }),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        toast.success(
          data.message || "Registration successful! Redirecting to login..."
        );
        setTimeout(() => navigate("/login"), 2000);
        return true;
      } else if (response.status === 400) {
        const data = await response.json();
        toast.error(
          data.message || "Invalid data provided. Please check your inputs."
        );
        // Stay on current step or go back to last step
      } else if (response.status === 409) {
        const data = await response.json();
        toast.error(
          data.message || "An account with this email already exists."
        );
      } else if (response.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        const data = await response.json();
        toast.error(data.message || "Registration failed. Please try again.");
      }
      return false;
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please check your connection and try again.");
      console.error("Registration error:", err);
      // Stay on last step so user can retry
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Validating activation token...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  //   if (!isValidToken) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-background p-4">
  //         <Card className="w-full max-w-md">
  //           <CardHeader className="text-center">
  //             <div className="flex justify-center mb-4">
  //               <XCircle className="h-16 w-16 text-destructive" />
  //             </div>
  //             <CardTitle>Invalid Activation Link</CardTitle>
  //             <CardDescription className="text-base mt-2">
  //               {error}
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent className="space-y-2">
  //             <Button
  //               onClick={() => navigate("/login")}
  //               className="w-full hover:cursor-pointer"
  //             >
  //               Go to Login
  //             </Button>
  //             <Button
  //               onClick={() => window.location.reload()}
  //               variant="outline"
  //               className="w-full hover:cursor-pointer"
  //             >
  //               Try Again
  //             </Button>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Doctor Registration</CardTitle>
          <CardDescription>
            Complete your profile to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Stepper
            initialStep={1}
            onStepChange={(step) => {
              console.log(`Current step: ${step}`);
            }}
            onFinalStepCompleted={handleSubmit}
            backButtonText="Previous"
            nextButtonText="Next"
            onBeforeStepChange={(current, next) => {
              if (isSubmitting) return false;

              if (next > current) {
                switch (current) {
                  case 1:
                    return validateStep1();
                  case 2:
                    return validateStep2();
                  case 3:
                    return validateStep3();
                  case 4:
                    return validateStep4();
                  default:
                    return true;
                }
              }
              return true;
            }}
            disableStepIndicators={isSubmitting}
            backButtonProps={{ disabled: isSubmitting }}
            nextButtonProps={{ disabled: isSubmitting }}
          >
            <Step>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Welcome!</h2>
                <p className="text-muted-foreground">
                  Let's verify your information
                </p>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  Professional Information
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    placeholder="e.g., Cardiology, Pediatrics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="60"
                    value={formData.years_of_experience || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        years_of_experience: value === "" ? 0 : parseInt(value),
                      });
                    }}
                    placeholder="0-60"
                    required
                  />
                </div>
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Contact Details</h2>
                <div className="space-y-2">
                  <Label htmlFor="organisation">Organisation *</Label>
                  <Input
                    id="organisation"
                    value={formData.organisation}
                    onChange={(e) =>
                      setFormData({ ...formData, organisation: e.target.value })
                    }
                    placeholder="Hospital or Clinic Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>
            </Step>

            <Step>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Security</h2>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Minimum 8 characters"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hover:cursor-pointer absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hover:cursor-pointer absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) =>
                      setAgreeTerms(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I confirm that all the data provided is accurate and valid*
                  </Label>
                </div>
                {isSubmitting && (
                  <div className="flex items-center justify-center pt-4 animate-pulse">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Registering...</span>
                  </div>
                )}
              </div>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </div>
  );
}
