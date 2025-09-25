// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // si usás vue-router
import axios from "axios";

// Configuración base de Axios
axios.defaults.baseURL = "http://192.168.1.15:3000/"; // apuntá a tu backend
axios.defaults.headers.common["Content-Type"] = "application/json";

// Opcional: podés usar interceptores
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Error en Axios:", error);
        return Promise.reject(error);
    }
);

const app = createApp(App);

// Hacer que axios esté disponible en todos los componentes con this.$axios
app.config.globalProperties.$axios = axios;

app.use(router);
app.mount("#app");
