function ErrorText({ styleClass, children }) {
  return (
    <div className={`text-center  text-error ${styleClass}`}>{children}</div>
  );
}

export default ErrorText;
