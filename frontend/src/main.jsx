import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
                colorScheme: "auto",
                primaryColor: "blue",
                colors: {
                    blue: [
                        "#e3f2fd",
                        "#bbdefb",
                        "#90caf9",
                        "#64b5f6",
                        "#42a5f5",
                        "#2196f3",
                        "#1e88e5",
                        "#1976d2",
                        "#1565c0",
                        "#0d47a1",
                    ],
                },
            }}
        >
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </MantineProvider>
    </StrictMode>
);
