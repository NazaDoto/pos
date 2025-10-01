<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Panel de Administración</h1>
      <div class="flex items-center gap-3">
        <!-- Botón Cambiar Contraseña -->
        <button @click="mostrarModal = true"
          class="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v1h1a1 1 0 011 1v6a1 1 
              0 01-1 1H8a1 1 0 01-1-1v-6a1 1 0 011-1h1v-1c0-1.1.9-2 2-2s2 
              .9 2 2v1" />
          </svg>
          Cambiar Contraseña
        </button>

        <!-- Botón Cerrar Sesión -->
        <button @click="cerrarSesion"
          class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 
              01-2 2H5a2 2 0 01-2-2V7a2 2 0 
              012-2h6a2 2 0 012 2v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div v-if="mostrarModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Cambiar Contraseña
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600">Contraseña Actual</label>
            <input v-model="formPass.actual" type="password"
              class="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm text-gray-600">Nueva Contraseña</label>
            <input v-model="formPass.nueva" type="password"
              class="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm text-gray-600">Confirmar Contraseña</label>
            <input v-model="formPass.confirmar" type="password"
              class="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <!-- Botones -->
        <div class="mt-6 flex justify-end gap-3">
          <button @click="mostrarModal = false"
            class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button @click="cambiarPassword"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            Guardar
          </button>
        </div>
      </div>
    </div>


    <!-- Sección de Usuarios -->
    <div class="bg-white shadow-lg rounded-xl p-6">
      <h2 class="text-xl font-semibold mb-6 text-gray-700 border-b pb-3">
        Gestión de Usuarios
      </h2>

      <div class="overflow-x-auto rounded-lg">
        <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
            <tr>
              <th class="px-6 py-3 text-left">ID</th>
              <th class="px-6 py-3 text-left">Nombre</th>
              <th class="px-6 py-3 text-left">Email</th>
              <th class="px-6 py-3 text-left">Nivel</th>
              <th class="px-6 py-3 text-center">Habilitado</th>
              <th class="px-6 py-3 text-center">Cuenta Activa</th>
              <th class="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-sm">
            <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                {{ usuario.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <input v-model="usuario.name"
                  class="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <input v-model="usuario.email"
                  class="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select v-model="usuario.nivel"
                  class="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </td>
              <td class="px-6 py-4 text-center">
                <input type="checkbox" :checked="usuario.habilitado === 1"
                  @change="usuario.habilitado = $event.target.checked ? 1 : 0"
                  class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="esCuentaActiva(usuario.fecha_activacion)
                  ? 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium'
                  : 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium'">
                  {{ esCuentaActiva(usuario.fecha_activacion) ? 'Activa' : 'Expirada' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <button v-if="!esCuentaActiva(usuario.fecha_activacion)" @click="activarCuenta(usuario)"
                  class="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition shadow-sm">
                  +30 días
                </button>
                <button @click="updateUsuario(usuario)"
                  class="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition shadow-sm">
                  Guardar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estados -->
      <div v-if="loading" class="mt-6 text-gray-500">Cargando usuarios...</div>
      <div v-if="error" class="mt-6 text-red-500">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminComponent",
  data() {
    return {
      usuarios: [],
      loading: false,
      error: null,
      mostrarModal: false,
      formPass: {
        actual: "",
        nueva: "",
        confirmar: "",
      },
    };
  },
  mounted() {
    this.fetchUsuarios();
  },
  methods: {
    esCuentaActiva(fecha) {
      if (!fecha) return false;
      const fechaActivacion = new Date(fecha);
      const ahora = new Date();
      const diasDiferencia =
        (ahora - fechaActivacion) / (1000 * 60 * 60 * 24);
      return diasDiferencia <= 30;
    },

    async fetchUsuarios() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("/fetchUsuarios");
        this.usuarios = response.data;
      } catch (err) {
        this.error = "Error al cargar los usuarios";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updateUsuario(usuario) {
      try {
        await axios.put("/updateUsuario", usuario);
        alert(`Usuario ${usuario.name} actualizado correctamente`);
      } catch (err) {
        console.error(err);
        alert("Error al actualizar usuario");
      }
    },

    async activarCuenta(usuario) {
      try {
        await axios.put("/activarUsuario", { id: usuario.id });
        usuario.fecha_activacion = new Date();
        alert("Cuenta activada por 30 días más");
      } catch (error) {
        console.error(error);
        alert("Error al activar la cuenta");
      }
    },

    async cambiarPassword() {
      if (this.formPass.nueva !== this.formPass.confirmar) {
        alert("Las contraseñas no coinciden");
        return;
      }

      try {
        await axios.put("/cambiarPASS", {
          actual: this.formPass.actual,
          nueva: this.formPass.nueva,
          userId: localStorage.getItem('id')
        });
        alert("Contraseña cambiada correctamente");
        this.mostrarModal = false;
        this.formPass = { actual: "", nueva: "", confirmar: "" };
      } catch (err) {
        console.error(err);
        alert("Error al cambiar contraseña");
      }
    },

    cerrarSesion() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
};
</script>
