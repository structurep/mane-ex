"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Store,
  GraduationCap,
  Check,
} from "lucide-react";
import { signUp, signInWithGoogle, type AuthState } from "@/actions/auth";
import { AlertBanner } from "@/components/tailwind-plus";

const accountTypes = [
  {
    key: "buyer",
    icon: User,
    label: "Buyer",
    description:
      "Browse horses, save favorites, make offers, and buy with escrow protection.",
  },
  {
    key: "seller",
    icon: Store,
    label: "Seller",
    description:
      "List horses, manage inquiries, accept offers, and get paid securely.",
  },
  {
    key: "trainer",
    icon: GraduationCap,
    label: "Trainer / Dealer",
    description:
      "Manage clients, browse for buyers, list horses, and track commissions.",
  },
];

const disciplines = [
  "Hunter/Jumper",
  "Dressage",
  "Eventing",
  "Equitation",
  "Western",
  "Reining",
  "Breeding",
];

const experienceLevels = [
  { value: "", label: "Select experience level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];

const primaryDisciplines = [
  { value: "", label: "Select primary discipline" },
  { value: "hunter-jumper", label: "Hunter/Jumper" },
  { value: "dressage", label: "Dressage" },
  { value: "eventing", label: "Eventing" },
  { value: "equitation", label: "Equitation" },
  { value: "western", label: "Western" },
  { value: "reining", label: "Reining" },
  { value: "breeding", label: "Breeding" },
  { value: "other", label: "Other" },
];

const inputClassName =
  "w-full rounded-lg border border-crease-light bg-paper-white px-4 py-3 text-sm text-ink-black placeholder:text-ink-light focus-visible:ring-2 focus-visible:ring-crease-light focus-visible:outline-none";

const labelClassName = "mb-1.5 block text-sm font-medium text-ink-black";

export function SignupWizard() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    city: "",
    state: "",
    disciplines: [] as string[],
    minPrice: "",
    maxPrice: "",
    experienceLevel: "",
    farmName: "",
    primaryDiscipline: "",
    horseCount: "",
  });

  const [authState, authAction, pending] = useActionState<AuthState, FormData>(
    signUp,
    {}
  );

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDiscipline = (discipline: string) => {
    setFormData((prev) => ({
      ...prev,
      disciplines: prev.disciplines.includes(discipline)
        ? prev.disciplines.filter((d) => d !== discipline)
        : [...prev.disciplines, discipline],
    }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return accountType !== null;
      case 2:
        return (
          formData.email.length > 0 &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword
        );
      case 3:
        return formData.fullName.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("email", formData.email);
    fd.append("password", formData.password);
    fd.append("full_name", formData.fullName);
    fd.append("role", accountType || "buyer");
    authAction(fd);
  };

  // Show success state after signup
  if (authState.success) {
    return (
      <div className="rounded-lg border border-forest/20 bg-forest/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
          <Check className="h-6 w-6 text-forest" />
        </div>
        <p className="text-lg font-medium text-forest">Check your email</p>
        <p className="mt-2 text-sm text-ink-mid">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink-black">{formData.email}</span>.
          Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-card)] text-sm font-medium ${
                s < step
                  ? "bg-oxblood text-white"
                  : s === step
                    ? "bg-paddock text-white"
                    : "bg-paper-cream text-ink-light"
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 w-8 ${s < step ? "bg-oxblood" : "bg-paper-cream"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error display */}
      {authState.error && (
        <AlertBanner variant="error" className="mb-6">{authState.error}</AlertBanner>
      )}

      {/* Step 1: Account Type */}
      {step === 1 && (
        <div>
          <h2 className="mb-1 text-center font-serif text-xl font-semibold text-ink-black">
            How will you use ManeExchange?
          </h2>
          <p className="mb-6 text-center text-sm text-ink-mid">
            You can always change this later
          </p>

          <div className="space-y-3">
            {accountTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = accountType === type.key;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setAccountType(type.key)}
                  className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary shadow-folded"
                      : "border-crease-light shadow-flat hover:shadow-folded"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "bg-paper-warm text-ink-mid"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-black">{type.label}</p>
                    <p className="mt-0.5 text-sm text-ink-mid">
                      {type.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto shrink-0">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Login Details */}
      {step === 2 && (
        <div>
          <h2 className="mb-1 text-center font-serif text-xl font-semibold text-ink-black">
            Create your account
          </h2>
          <p className="mb-6 text-center text-sm text-ink-mid">
            Your login credentials
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClassName}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="8+ characters"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClassName}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={inputClassName}
              />
              {formData.confirmPassword.length > 0 &&
                formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="crease-divider w-full" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-paper-cream px-3 text-xs text-ink-light">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <form action={signInWithGoogle}>
              <Button type="submit" variant="outline" className="w-full">
                Continue with Google
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Step 3: Profile */}
      {step === 3 && (
        <div>
          <h2 className="mb-1 text-center font-serif text-xl font-semibold text-ink-black">
            Tell us about yourself
          </h2>
          <p className="mb-6 text-center text-sm text-ink-mid">
            Help others get to know you
          </p>

          <div className="space-y-4">
            {/* Avatar upload placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-paper-warm">
                <User className="h-6 w-6 text-ink-light" />
              </div>
              <Button variant="outline" size="sm">
                Upload Photo
              </Button>
            </div>

            <div>
              <label htmlFor="fullName" className={labelClassName}>
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className={labelClassName}>
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelClassName}>
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  autoComplete="address-level1"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preferences */}
      {step === 4 && (
        <div>
          <h2 className="mb-1 text-center font-serif text-xl font-semibold text-ink-black">
            Set your preferences
          </h2>
          <p className="mb-6 text-center text-sm text-ink-mid">
            We&apos;ll personalize your experience
          </p>

          {/* Buyer / Trainer preferences */}
          {(accountType === "buyer" || accountType === "trainer") && (
            <div className="space-y-5">
              {/* Discipline interests */}
              <div>
                <label className={labelClassName}>Discipline Interests</label>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((d) => {
                    const isSelected = formData.disciplines.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`rounded-[var(--radius-card)] border px-3 py-1.5 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-crease-light bg-paper-white text-ink-mid hover:border-ink-light"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price range */}
              <div>
                <label className={labelClassName}>Price Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Min ($)"
                    value={formData.minPrice}
                    onChange={(e) => updateField("minPrice", e.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Max ($)"
                    value={formData.maxPrice}
                    onChange={(e) => updateField("maxPrice", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Experience level */}
              <div>
                <label htmlFor="experienceLevel" className={labelClassName}>
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    updateField("experienceLevel", e.target.value)
                  }
                  className={inputClassName}
                >
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Seller preferences */}
          {accountType === "seller" && (
            <div className="space-y-5">
              {/* Farm name */}
              <div>
                <label htmlFor="farmName" className={labelClassName}>
                  Barn Name{" "}
                  <span className="font-normal text-ink-light">(optional)</span>
                </label>
                <input
                  id="farmName"
                  type="text"
                  placeholder="Your barn or training facility name"
                  value={formData.farmName}
                  onChange={(e) => updateField("farmName", e.target.value)}
                  className={inputClassName}
                />
              </div>

              {/* Primary discipline */}
              <div>
                <label htmlFor="primaryDiscipline" className={labelClassName}>
                  Primary Discipline
                </label>
                <select
                  id="primaryDiscipline"
                  value={formData.primaryDiscipline}
                  onChange={(e) =>
                    updateField("primaryDiscipline", e.target.value)
                  }
                  className={inputClassName}
                >
                  {primaryDisciplines.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of horses */}
              <div>
                <label className={labelClassName}>
                  How many horses do you plan to list?
                </label>
                <div className="flex gap-2">
                  {["1-3", "4-10", "10+"].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateField("horseCount", count)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        formData.horseCount === count
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-crease-light bg-paper-white text-ink-mid hover:border-ink-light"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} type="button">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            type="button"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={pending || !canProceed()}
            type="button"
          >
            {pending ? "Creating Account..." : "Create Account"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
