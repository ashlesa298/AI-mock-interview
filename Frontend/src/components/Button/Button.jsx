import "./Button.css";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? "btn-full" : ""}`}
      {...rest}
    >
      {loading ? <span className="btn-spinner" /> : icon}
      <span>{loading ? "Please wait..." : children}</span>
    </button>
  );
};

export default Button;