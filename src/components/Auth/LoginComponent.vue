<template>
  <div class="flex justify-center bg-gray-100 px-4 h-screen bg-gradient-to-r from-blue-600 to-indigo-700">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 py-10 mt-20 h-fit-content">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">
        Iniciar Sesión
      </h2>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="loginUser" class="space-y-5 ">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" v-model="form.email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="ejemplo@correo.com" required />
        </div>

        <!-- Contraseña -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input type="password" v-model="form.password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="********" required />
        </div>

        <!-- Botón -->
        <button type="submit"
          class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          :disabled="loading">
          <span v-if="loading">Ingresando...</span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <!-- Registro link -->
      <p class="text-sm text-gray-600 mt-6 text-center">
        ¿No tienes cuenta?
        <router-link to="/register" class="text-indigo-600 hover:underline">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginComponent",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      errorMessage: "",
      loading: false,
    };
  },
  methods: {
    async loginUser() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const res = await axios.post("/auth/login", this.form);
        if (res.data.token) {
          // Guardar datos en localStorage
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("name", JSON.stringify(res.data.name));
          localStorage.setItem("id", JSON.stringify(res.data.id));
          localStorage.setItem("nivel", JSON.stringify(res.data.nivel));

          // Redireccionamiento según usuario
          const userId = res.data.id;
          if (userId == "1") {
            this.$router.push("/admin"); // admin
          } else {
            this.$router.push("/home");  // usuario normal
          }
        }
      } catch (error) {
        this.errorMessage = error.response?.data.error || "Error al iniciar sesión";
      } finally {
        this.loading = false;
      }
    },

  },
};
</script>
<style>
.h-fit-content {
  height: fit-content;
}
</style>
