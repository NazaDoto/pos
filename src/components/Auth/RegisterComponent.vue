<template>
  <div class="flex justify-center bg-gray-100 px-4 h-screen">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 py-10 mt-20 h-fit-content">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">
        Crear Cuenta
      </h2>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="registerUser" class="space-y-5">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            v-model="form.name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            v-model="form.email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <!-- Contraseña -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            v-model="form.password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="********"
            required
          />
        </div>

        <!-- Botón -->
        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          :disabled="loading"
        >
          <span v-if="loading">Registrando...</span>
          <span v-else>Registrarse</span>
        </button>
      </form>

      <!-- Login link -->
      <p class="text-sm text-gray-600 mt-6 text-center">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="text-indigo-600 hover:underline">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RegisterComponent",
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
      },
      errorMessage: "",
      loading: false,
    };
  },
  methods: {
    async registerUser() {
      this.loading = true;
      this.errorMessage = "";
      try {
        await axios.post("/auth/register", this.form);
        this.$router.push("/login");
      } catch (error) {
        this.errorMessage = error.response?.data?.error || "Error al registrar usuario";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
