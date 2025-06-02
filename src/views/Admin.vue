<template>
  <div class="admin-panel" role="main">
    <!-- 🔹 Encabezado -->
    <header class="admin-header">
      <h1>Panel de Administración</h1>
      <input v-model="filtro" placeholder="🔍 Buscar término o categoría..." class="buscador-admin" aria-label="Buscar término" />
      <select v-model="tipoSeleccionado" class="filtro-tipo" aria-label="Filtrar por tipo de término">
        <option value="">Todos los tipos</option>
        <option value="abreviatura">Abreviatura</option>
        <option value="forma farmacéutica">Forma farmacéutica</option>
        <option value="término completo">Término completo</option>
      </select>
      <button @click="limpiarFiltros" class="boton-limpiar" aria-label="Limpiar filtros">Limpiar filtros</button>
      <button @click="recargarDatos" class="boton-recargar" aria-label="Recargar datos">Recargar datos</button>
    </header>

    <!-- 🔹 Tabla de términos -->
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Término</th>
          <th>Traducción</th>
          <th>Pronunciación</th>
          <th>Categoría</th>
          <th>Definición</th>
          <th>Sinónimos</th>
          <th>Tipo</th>
          <th>Forma Farmacéutica</th>
          <th>Imagen</th>
          <th>Fecha Agregado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginados" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.termino }}</td>
          <td>{{ item.traduccion }}</td>
          <td>{{ item.pronunciacion }}</td>
          <td>{{ item.categoria }}</td>
          <td>{{ item.definicion }}</td>
          <td>{{ item.sinonimos }}</td>
          <td>{{ item.tipo_termino }}</td>
          <td>{{ item.forma_farmaceutica }}</td>
          <td>{{ item.imagen }}</td>
          <td>{{ item.fecha_agregado }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 🔹 Mensaje de éxito -->
    <div v-if="mensajeExito" class="mensaje-exito" role="status" aria-live="polite">
      {{ mensajeExito }}
    </div>

    <!-- 🔹 Paginación -->
    <div class="paginacion" role="navigation" aria-label="Paginación de resultados">
      <button @click="cambiarPagina('inicio')" v-if="paginaActual > 3">inicio</button>
      <button @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">&lt;</button>
      <button v-for="n in paginasMostradas" :key="n" :class="{ activa: n === paginaActual }" @click="cambiarPagina(n)">{{ n }}</button>
      <button @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">&gt;</button>
      <button @click="cambiarPagina(totalPaginas)" v-if="paginaActual < totalPaginas - 2">final</button>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabase/client'

export default {
  name: 'Admin',
  data() {
    return {
      terminos: [],
      originales: {},
      filtro: '',
      tipoSeleccionado: '',
      paginaActual: 1,
      porPagina: 10,
      mensajeExito: ''
    }
  },
  computed: {
    filtrados() {
      const texto = this.filtro.trim().toLowerCase()
      return this.terminos.filter(item => {
        const coincideTipo = this.tipoSeleccionado ? item.tipo_termino === this.tipoSeleccionado : true
        return coincideTipo && [item.termino, item.traduccion, item.categoria, item.definicion, item.tipo_termino, item.forma_farmaceutica]
          .some(campo => campo?.toLowerCase().includes(texto))
      })
    },
    totalPaginas() {
      return Math.ceil(this.filtrados.length / this.porPagina)
    },
    paginados() {
      const inicio = (this.paginaActual - 1) * this.porPagina
      return this.filtrados.slice(inicio, inicio + this.porPagina)
    },
    paginasMostradas() {
      if (this.totalPaginas <= 3) {
        return Array.from({ length: this.totalPaginas }, (_, i) => i + 1)
      } else if (this.paginaActual <= 3) {
        return [1, 2, 3]
      } else if (this.paginaActual >= this.totalPaginas - 2) {
        return [this.totalPaginas - 2, this.totalPaginas - 1, this.totalPaginas]
      } else {
        return [this.paginaActual - 1, this.paginaActual, this.paginaActual + 1]
      }
    }
  },
  methods: {
    async cargarTerminos() {
      const { data, error } = await supabase.from('base_datos').select('*')
      if (error) {
        console.error('❌ Error cargando términos:', error)
      } else {
        console.log('✅ Términos cargados:', data)
        this.terminos = data
        this.originales = Object.fromEntries(data.map(item => [item.id, { ...item }]))
      }
    },
    async recargarDatos() {
      const { data, error } = await supabase.from('base_datos').select('*')
      if (error) {
        console.error('❌ Error al recargar datos:', error)
      } else {
        this.originales = Object.fromEntries(data.map(item => [item.id, { ...item }]))
        this.terminos = data
        this.paginaActual = 1
        this.filtro = ''
        this.tipoSeleccionado = ''
        this.mensajeExito = '🔄 Datos recargados correctamente'
        setTimeout(() => (this.mensajeExito = ''), 3000)
      }
    },
    cambiarPagina(n) {
      if (n === 'inicio') this.paginaActual = 1
      else if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n
    },
    limpiarFiltros() {
      this.filtro = ''
      this.tipoSeleccionado = ''
      this.paginaActual = 1
    }
  },
  mounted() {
    this.cargarTerminos()
  }
}
</script>

<style scoped>
.admin-panel {
  padding: 2rem;
  color: #fafafa;
  max-width: 1200px;
  margin: auto;
}
.admin-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}
.buscador-admin {
  margin-top: 1rem;
  padding: 0.5rem;
  width: 100%;
  max-width: 500px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.admin-table th,
.admin-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
.admin-table input,
.admin-table textarea {
  width: 100%;
}
.admin-table .cambio {
  background-color: #fff8c4;
}
.paginacion {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.paginacion button {
  padding: 6px 10px;
}
.paginacion .activa {
  font-weight: bold;
  background: #00ffd0;
  color: #000;
}
</style>
