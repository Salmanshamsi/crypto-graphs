import CustomButton from "@/components/custom-button";
import TextField from "@/components/custom-text-field";
import { useToast } from "@/context/toast-alert";
import { AppDispatch } from "@/store";
import { loginUser } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

type LoginFormData = {
  email: string;
  password: string;
};

const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const toast = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        loginUser({
          appType: "ADMIN_DASHBOARD",
          ...data,
        })
      );
      if (response.payload.success) {
        toast.success("Login successful", "Success");
        localStorage.setItem("token", response.payload.tokens.access.token);
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
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

            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                />
              )}
            />

            {/* Submit Button */}
            <div>
              <CustomButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                isDisabled={isLoading}
                loadingText="Signing in..."
              >
                Sign in
              </CustomButton>
            </div>
            <div>
              <CustomButton
                onClick={() => {
                  navigate("/auth/forget-password");
                }}
                variant="outline"
                size="md"
                fullWidth
              >
                Forget password
              </CustomButton>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              Please enter your login information to sign in.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
