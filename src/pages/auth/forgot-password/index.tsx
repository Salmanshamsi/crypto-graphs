import BackButton from "@/components/custom-back-btn";
import CustomButton from "@/components/custom-button";
import TextField from "@/components/custom-text-field";
import { useToast } from "@/context/toast-alert";
import { AppDispatch } from "@/store";
import { forgetPassword } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";

type ForgetPasswordData = {
  email: string;
};

const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

const ForgetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgetPasswordData) => {
    setIsLoading(true);
    try {
      const response = await dispatch(forgetPassword(data));
      if (response.payload.success) {
        toast.success(
          response?.payload?.message || "email successfully sent",
          "Success"
        );
      }
    } catch (error) {
      console.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <BackButton fallback="/auth/login" />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Enter email for password reset
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <div>
              <CustomButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Submit
              </CustomButton>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              By clicking Sign in to join or sign in, you agree to Spokyn's .
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
