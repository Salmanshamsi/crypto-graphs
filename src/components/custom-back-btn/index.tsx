import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../custom-button";

interface BackButtonProps {
  fallback?: string;
  onBack?: () => void;
}

const BackButton = ({ fallback = "/auth/login", onBack }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
    if (onBack) {
      setTimeout(() => {
        onBack();
      }, 0);
    }
  };

  return (
    <CustomButton
      type="button"
      onClick={handleBack}
      variant="outline"
      className="h-12 w-12"
    >
      <ArrowLeft className="h-6 w-6" />
    </CustomButton>
  );
};

export default BackButton;
