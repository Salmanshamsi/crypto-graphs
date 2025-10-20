import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import CustomButton from "@/components/custom-button";
import TextField from "@/components/custom-text-field";
import { AppDispatch } from "@/store";
import { useQuery } from "@/utils";
import BackButton from "@/components/custom-back-btn";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/toast-alert";
import { resetPassword } from "@/store/auth";

type ResetPasswordData = {
  password: string;
  confirmPassword: string;
};

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const query = useQuery();
  const token = query.get("token");
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toast.error("Invalid or missing token", "Error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await dispatch(
        resetPassword({
          password: data.password,
          token,
        })
      );

      if (response.payload?.success) {
        navigate("/auth/login");
        toast.success(
          response.payload.message || "Password reset successfully",
          "Success"
        );
      } else {
        toast.error(
          response.payload?.message || "Password reset failed",
          "Error"
        );
      }
    } catch (error) {
      console.error("Reset password failed", error);
      toast.error("Something went wrong", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <BackButton fallback="/auth/forget-password" />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Now you can reset your password
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="password"
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {/* Submit */}
            <div>
              <CustomButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                isDisabled={isLoading}
                loadingText="Submitting..."
              >
                Submit
              </CustomButton>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-xs text-gray-500">
              By resetting your password, you agree to Spokyn&apos;s Terms &
              Privacy Policy.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
