import App from "./App";
import ThemeProvider from "./theme/ThemeProvider";

const Providers = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};
export default Providers;
