import "./Loader.css";

const Loader = ({ fullScreen = false, label = "Loading..." }) => {
  return (
    <div className={fullScreen ? "loader-fullscreen" : "loader-inline"}>
      <div className="loader-ring" />
      {label && <p className="loader-label">{label}</p>}
    </div>
  );
};

export default Loader;