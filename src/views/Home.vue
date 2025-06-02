<template>
  <main class="contenedor-home">
    <!-- 🔹 SECCIÓN: Encabezado -->
    <header class="encabezado">
    <img src="/img/logo.png" alt="Logo Diccionario AR" class="logo-vertical" />
    <h1 class="titulo-logo">Diccionario AR</h1>
    </header>

    <!-- 🔹 SECCIÓN: Buscador -->
    <section class="buscador">
      <input
        v-model="busqueda"
        @input="buscarTermino"
        type="text"
        placeholder="Escribe un término o su traducción"
        class="input-busqueda"
      />
      <button @click="buscarTermino" class="boton-buscar">Buscar</button>
    </section>

    <!-- 🔹 SECCIÓN: Sugerencias de corrección -->
    <section v-if="sugerencias.length > 0" class="sugerencias">
      <p>¿Quisiste decir?</p>
      <ul>
        <li v-for="(s, i) in sugerencias.slice(0, 4)" :key="i">
          <button @click="usarSugerencia(s)">{{ s }}</button>
        </li>
      </ul>
    </section>

    <!-- 🔹 SECCIÓN: Resultados -->
    <section v-if="resultado" class="resultado">
      <h2>{{ resultado.termino }}</h2>
      <p><strong>Traducción:</strong> {{ resultado.traduccion }}</p>
      <p><strong>Pronunciación:</strong> {{ resultado.pronunciacion }}</p>
      <p><strong>Tipo:</strong> {{ resultado.tipo_termino }}</p>
      <p><strong>Definición:</strong> {{ resultado.definicion }}</p>

      <div v-if="resultado.sinonimos && resultado.sinonimos.length > 0">
        <strong>Sinónimos:</strong>
        <div class="sinonimos">
          <span
            v-for="(sin, i) in resultado.sinonimos"
            :key="i"
            class="sinonimo-boton"
          >
            {{ sin }}
          </span>
        </div>
      </div>

      <!-- 🔹 SECCIÓN: Imagen relacionada (si aplica) -->
      <div v-if="resultado.imagen">
        <img
          :src="`/img/instrumentos/${resultado.imagen}`"
          alt="Imagen relacionada"
          class="imagen-instrumento"
        />
      </div>
    </section>

    <!-- 🔹 SECCIÓN: Botón sugerir término -->
    <section class="sugerencia-flotante">
      <button @click="mostrarModal = true" class="boton-sugerencia">
        💡 Sugerir término
      </button>
    </section>

    <!-- 🔹 SECCIÓN: Modal para sugerir término -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-contenido">
        <h3>Sugerencia</h3>
        <textarea
          v-model="sugerenciaTexto"
          placeholder="Escribe tu sugerencia aquí..."
        ></textarea>
        <button @click="enviarSugerencia">Enviar</button>
        <button @click="mostrarModal = false">Cerrar</button>
      </div>
    </div>
  </main>
</template>

<script>
// 🔹 IMPORTACIÓN: Cliente Supabase
import { supabase } from '../supabase/client'

export default {
  name: 'Home',
  data() {
    return {
      // 🔹 DATO: Entrada del usuario
      busqueda: '',
      // 🔹 DATO: Resultado exacto del término buscado
      resultado: null,
      // 🔹 DATO: Lista de sugerencias parciales
      sugerencias: [],
      // 🔹 DATO: Lista completa de términos
      glosario: [],
      glosarioCargado: false,
      // 🔹 DATO: Modal de sugerencia
      mostrarModal: false,
      sugerenciaTexto: ''
    }
  },
  methods: {
    // 🔹 ACCIÓN: Buscar término exacto o mostrar sugerencias
    buscarTermino() {
      const texto = this.busqueda.trim().toUpperCase()
      if (!texto || !this.glosarioCargado) return

      this.resultado = this.glosario.find(item =>
        item.termino?.toUpperCase() === texto ||
        item.traduccion?.toUpperCase() === texto
      ) || null

      this.sugerencias = this.glosario
        .filter(item =>
          item.termino?.toUpperCase().includes(texto) ||
          item.traduccion?.toUpperCase().includes(texto)
        )
        .map(item => item.termino)
        .filter((v, i, arr) => arr.indexOf(v) === i) // únicos
    },

    // 🔹 ACCIÓN: Reutilizar una sugerencia
    usarSugerencia(termino) {
      this.busqueda = termino
      this.buscarTermino()
    },

    // 🔹 ACCIÓN: Enviar sugerencia al backend (placeholder por ahora)
    enviarSugerencia() {
      console.log('Sugerencia enviada:', this.sugerenciaTexto)
      this.sugerenciaTexto = ''
      this.mostrarModal = false
    }
  },
  async mounted() {
    // 🔹 ACCIÓN: Cargar glosario desde Supabase al cargar la vista
    const { data, error } = await supabase
      .from('base_datos')
      .select('*')

    if (error) {
      console.error('❌ Error al cargar glosario:', error)
    } else {
      this.glosario = data
      this.glosarioCargado = true
      console.log('✅ Glosario cargado:', data)
    }
  }
}
</script>

<style scoped>
/* 🔸 ESTILO: Contenedor general */
.contenedor-home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #111;
  text-align: center;
}

/* 🔸 ESTILO: Buscador */
.input-busqueda {
  width: 70%;
  padding: 10px;
  margin-right: 10px;
}

.boton-buscar {
  padding: 10px 20px;
}

/* 🔸 ESTILO: Resultados */
.resultado {
  margin-top: 2rem;
}

/* 🔸 ESTILO: Sinónimos */
.sinonimos {
  margin-top: 0.5rem;
}
.sinonimo-boton {
  background: #00ffd0;
  color: #000;
  padding: 5px 10px;
  margin: 5px;
  display: inline-block;
}

/* 🔸 ESTILO: Sugerencias */
.sugerencias ul {
  list-style: none;
  padding: 0;
}
.sugerencias li button {
  margin: 5px;
  padding: 5px 10px;
}

/* 🔸 ESTILO: Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-contenido {
  background: #111;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
}

/* 🔸 ESTILO: Imagen relacionada */
.imagen-instrumento {
  margin-top: 1rem;
  max-width: 100%;
  border-radius: 8px;
}

/* 🔸 ESTILO: Encabezado centrado con logo arriba */
.encabezado-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.logo-vertical {
  width: 120px; /* Ajusta según tamaño visual real */
  height: auto;
  margin-bottom: 1rem;
}

.titulo-principal {
  font-family: 'Nunito', sans-serif;
  font-size: 2rem;
  text-align: center;
  margin: 0;
  font-weight: bold;
}
</style>
