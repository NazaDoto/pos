<template>
    <div class="min-h-screen flex flex-col">
        <!-- Navbar -->
        <header class="bg-white shadow-md py-4 px-2">
            <div class="container mx-auto md:px-6 py-4 flex justify-between items-center">
                <!-- Logo -->
                <h1 class="text-2xl font-bold text-gray-800"></h1>

                <!-- Links -->
                <nav class="flex flex-row gap-4">
                    <template v-if="isLoggedIn">
                        <!-- Si está logueado -->
                        <router-link to="/home"
                            class="text-center px-2 py-1 md:px-4 md:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                            Inicio
                        </router-link>
                        <button @click="logout"
                            class="text-center px-2 py-1 md:px-4 md:py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition">
                            Cerrar Sesión
                        </button>
                    </template>

                    <template v-else>
                        <!-- Si NO está logueado -->
                        <router-link to="/login"
                            class="text-center px-2 py-1 md:px-4 md:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                            Iniciar Sesión
                        </router-link>
                        <router-link to="/register"
                            class="text-center px-2 py-1 md:px-4 md:py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition">
                            Registrarse
                        </router-link>
                    </template>
                </nav>
            </div>
        </header>

        <!-- Hero -->
        <section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
            <div class="container mx-auto px-6 text-center">
                <h2 class="text-4xl md:text-5xl font-bold mb-6">
                    Potenciá tu negocio con Inteligencia Artificial
                </h2>
                <p class="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                    Analizá informes, recibí recomendaciones y mejorá la administración de tu comercio
                    con nuestros planes adaptados a tus necesidades.
                </p>
            </div>
        </section>

        <!-- Planes -->
        <section class="py-20 bg-gray-50 flex-1">
            <div class="container mx-auto px-6">
                <h3 class="text-3xl font-bold text-center text-gray-800 mb-12">
                    Nuestros Planes
                </h3>

                <div class="grid md:grid-cols-3 gap-8">
                    <!-- Nivel 1 -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col">
                        <h4 class="text-xl font-bold mb-4 text-gray-800">Nivel 1</h4>
                        <p class="text-gray-600 mb-6">$20.000 / mes</p>
                        <ul class="space-y-3 mb-8 text-gray-600">
                            <li>✔️ Modelo GPT-3.5</li>
                            <li>✔️ Análisis básico de informes</li>
                            <li>✔️ Recomendaciones generales para ventas</li>
                        </ul>
                        <router-link :to="{ path: '/register', query: { nivel: 1 } }"
                            class="mt-auto block text-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                            Elegir Nivel 1
                        </router-link>
                        <button class="text-blue-600 hover:text-blue-800 transition font-medium mt-2"
                            @click="mostrarEjemplo(1)">Ver Ejemplo</button>
                    </div>

                    <!-- Nivel 2 -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col border-2 border-blue-600">
                        <h4 class="text-xl font-bold mb-4 text-gray-800">Nivel 2</h4>
                        <p class="text-gray-600 mb-6">$35.000 / mes</p>
                        <ul class="space-y-3 mb-8 text-gray-600">
                            <li>✔️ Modelo GPT-4</li>
                            <li>✔️ Análisis avanzado con más precisión</li>
                            <li>✔️ Recomendaciones personalizadas para tu negocio</li>
                            <li>✔️ Reportes interactivos y detallados</li>
                        </ul>
                        <router-link :to="{ path: '/register', query: { nivel: 2 } }"
                            class="mt-auto block text-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                            Elegir Nivel 2
                        </router-link>
                        <button class="text-blue-600 hover:text-blue-800 transition font-medium mt-2"
                            @click="mostrarEjemplo(2)">Ver Ejemplo</button>

                    </div>

                    <!-- Nivel 3 -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col ">
                        <h4 class="text-xl font-bold mb-4 text-gray-800">Nivel 3</h4>
                        <p class="text-gray-600 mb-6">$50.000 / mes</p>
                        <ul class="space-y-3 mb-8 text-gray-600">
                            <li>✔️ Modelo GPT-5</li>
                            <li>✔️ Análisis predictivo con IA de última generación</li>
                            <li>✔️ Se usan análisis previos para las nuevas recomendaciones</li>
                            <li>✔️ Estudio del mercado actual y tendencias en Argentina</li>
                            <li>✔️ Recomendaciones estratégicas y optimizadas</li>
                            <li>✔️ Soporte premium y asistencia personalizada</li>
                        </ul>
                        <router-link :to="{ path: '/register', query: { nivel: 3 } }"
                            class="mt-auto block text-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                            Elegir Nivel 3
                        </router-link>
                        <button class="text-blue-600 hover:text-blue-800 transition font-medium mt-2"
                            @click="mostrarEjemplo(3)">Ver Ejemplo</button>

                    </div>
                </div>
            </div>
        </section>
        <!-- Modal -->
         <transition name="fade">
      <div v-if="showModal"
        class="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
        @click.self="cerrarModal">
        <div class="bg-white rounded-lg shadow-lg max-w-200 w-full max-h-[80vh] overflow-y-auto relative p-6">
          <!-- Botón cerrar -->
          <button @click="cerrarModal"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold">
            ×
          </button>

          <h2 class="text-lg font-semibold mb-4 text-center">Ejemplo de Análisis Nivel {{ nivelSeleccionado }}</h2>
          <div class="text-gray-700 analisis-markdown" v-html="parseMarkdown(textoEjemplo)"></div>
        </div>
      </div>
    </transition>
        <!-- Footer -->
        <footer class="bg-white py-6 shadow-inner">
            <div class="container mx-auto px-6 text-center text-gray-600">
                © 2025. Todos los derechos reservados.
            </div>
        </footer>
    </div>
</template>

<script>
import { marked } from 'marked';

export default {
    data() {
        return {
            isLoggedIn: '',
            showModal: false,
            nivelSeleccionado: null,
            ejemplos: {
                1: `**Resumen sencillo:**
 El archivo analiza el ranking de ventas de diferentes productos en Argentina, mostrando las unidades vendidas, ventas acumuladas y porcentajes de venta de cada uno de ellos.
 
 **Principales hallazgos:**
 - El producto más vendido es el "PRIMORDIAL AC GIRASOL 700 ML", con ventas acumuladas de 430 unidades.
 - Los productos que le siguen en venta son vinos, cerveza, quesos, leche, azúcar, entre otros.
 - Hay una variedad de productos de consumo diario y de variedad, mostrando una diversidad en las preferencias de los consumidores argentinos.
 
 **Recomendaciones:**
 1. Crear bundles o promociones: 
    - Ofrecer un bundle de "EL CASTIGO MALBEC 750 ML" junto con "MOZZARI BURRATA" a un precio especial para fomentar la compra cruzada de vino y queso.
   
 2. Ajustar el surtido:
    - Dado el alto volumen de ventas de "PRIMORDIAL AC GIRASOL 700 ML", se puede considerar aumentar la visibilidad en la tienda mediante displays especiales o promociones destacadas.
 
 3. Promover productos de baja rotación:
    - Realizar promociones puntuales en productos menos vendidos como "ACAPULCO CHOCLO AMAR 300 GR" para aumentar su rotación y visibilidad en el mercado.`,
                2: `**Resumen ejecutivo:** 
 El contenido es un informe que detalla el ranking de ventas en Argentina. Aparentemente, los productos más vendidos son el aceite PRIMORDIAL AC GIRASOL y el vino EL CASTIGO MALBEC. También se pueden identificar tendencias en alimentos básicos como azúcar y quesos. 
 
 1. Principales hallazgos: 
     - El producto más vendido es el aceite de girasol PRIMORDIAL.
     - El segundo producto más vendido es vino MALBEC.
     - Hay una variedad de bebidas, alimentos y comestibles en la lista de ventas.
     - Se venden más alimentos como la burrata y fiambre que agua mineral.
     - Se puede encontrar conglomerado de unidades de venta de distintos precentajes en el ranking.
     - Coca cola y sus variantes tienen niveles de venta similares en la lista.
 
 2. Recomendaciones accionables: 
     - **Rápidas**: Aumentar la promoción de los productos más vendidos como aceite de girasol PRIMORDIAL y vino EL CASTIGO MALBEC para aprovechar su popularidad.
     - **De mediano plazo**: Observar las ventas de Coca Cola y sus variantes para considerar ofertas conjuntas que podrían aumentar las ventas de estas bebidas. Explorar la posibilidad de crear ofertas de productos que se venden juntos regularmente, como queso y vino. Evaluar la posibilidad de modificar el surtido de productos para incrementar las ventas de productos que tienen menor turno en las ventas.
 
 **Resumen:** 
 Podemos ver que en Argentina, ciertos productos tienen mayor aceptación en el mercado que otros. A corto plazo, se podría optimizar la promoción de productos más vendidos, como el aceite de girasol PRIMORDIAL y el vino EL CASTIGO MALBEC. A medio plazo, hay que poner énfasis en la variación de las ventas de productos que pertenecen a una misma marca, como Coca Cola, y considerar la implementación de ofertas conjuntas para incrementar las ventas. Además, sería útil readaptar los surtidos y mejorar la variedad de productos que tienen un menor rendimiento en las ventas.`,
                3: `1) **Resumen ejecutivo**
- El ranking confirma una canasta dual: alto volumen en básicos (aceite, azúcar, pastas, agua/sodas) y alto ticket en indulgencias/premium (vino, cervezas importadas, quesos especiales, “picada”).
- PRIMONDIAL aceite de girasol lidera en unidades; EL CASTIGO Malbec y cervezas importadas impulsan facturación por ticket.
- Bebidas dominan el mix: Coca-Cola (regular y Zero en paridad de unidades), aguas y sodas locales (Graziani/Clara).
- Quesos y deli (burrata, bocconcino, danbo, fiambre) muestran oportunidad de margen con pocos SKUs.
- Urgente depurar datos (fechas, montos atípicos, SKUs duplicados/erróneos) y reforzar stock y exhibición de top sellers; activar bundles orientados a “comidas completas”.

2) **Principales hallazgos**
- Líderes por unidades: aceite de girasol PRIMONDIAL (~410 u) y agua/sodas locales; básicos como azúcar (SARITA, LEDESMA), sal (Celusal), tomate triturado y choclo sostienen rotación.
- Alto valor por ticket: vino EL CASTIGO Malbec (~196 u, máxima facturación del top), cervezas importadas (Corona, Sol), quesos premium (burrata, bocconcino), “Picada”.
- Bebidas gaseosas: Coca-Cola Zero y regular con mismo volumen reportado (22 u c/u), más “vidrio retornable” presente; oportunidad para packs y retornables.
- Lácteos Manfrey con presencia transversal (leche, flan, rallado) y quesos masivos (cremoso, danbo) → escalera de precios completa en dairy.
- No alimenticio relevante: bolsas compactadoras con buena rotación (cross a limpieza/hogar).
- Señales de margen: categorías premium (quesos especiales, vinos, cervezas importadas) y deli muestran alto ingreso por unidad.
- Anomalías de datos: “Burrata 10 u” con facturación desproporcionada, líneas con valores negativos (“ART. VARIOS”), fechas inconsistentes y nombres de marcas con errores (Graziani/Grazimne), posibles duplicaciones.

3) **Recomendaciones accionables**
Acciones inmediatas (quick wins)
- Abastecimiento y exhibición
  - Asegurar stock, mayor facing y señalización de PRIMONDIAL aceite, EL CASTIGO Malbec, Corona/Sol, Coca-Cola (regular/Zero), aguas/sodas locales, azúcar y tomate triturado.
  - Implementar “puntos calientes” de fin de semana para vino + picada + quesos premium.
- Precios y packs
  - Armar escalera de precios clara en aceite (500-900-1500 ml) y alternativas value/private label junto al líder.
  - Impulsar retornables 1,5 L con precio visible por litro y promociones mix & match con Zero/regular.
- Bundles tácticos (señalización inmediata)
  - “Noche de pasta”: aceite + spaghetti La Campagnola + tomate triturado.
  - “Picada premium”: EL CASTIGO Malbec + burrata/bocconcino/danbo + pickles.
  - “Cervezas importadas”: Corona + Sol mix 3x2 o 70% en la 2ª unidad.
  - “Hidratación”: pack agua 6 L + 500 cc + soda.
- Data hygiene express
  - Bloquear/validar SKUs con montos atípicos, corregir nombres de marca y regularizar líneas negativas.

Acciones de mediano plazo
- Category management
  - Optimizar surtido dairy: mantener premium (burrata/bocconcino) y reforzar masivos (cremoso, danbo) con escalera de precios y roles (tracción vs margen).
  - Bebidas: ampliar packs familiares/retornables y multipacks; ajustar espacio a estacionalidad.
  - Desarrollar marca propia/value en básicos (azúcar, pasta, tomate, sal) para elasticidad al precio.
- Negociación y supply
  - Asegurar cupos con proveedores clave (aceite, vino top, cervezas importadas) y condiciones para mecánicas 70% en 2ª/3x2.
- Omnicanal
  - Curar combos “comidas completas” en e-commerce y entrega rápida; suscripción de aguas.
- Analítica y gobierno de datos
  - Tablero de margen por SKU, alerta de anomalías, catálogo maestro único, control de devoluciones y ajustes.

Ejemplos concretos de bundles, promociones o ajustes de surtido
- Bundles
  - “Pasta Night”: Spaghetti 500 g + tomate triturado 950 g + aceite 500/700 ml a precio combo.
  - “After office premium”: 2x Corona 330 + 1x Sol 330 + pickles + queso soft (burrata/bocconcino) -15%.
  - “Picada & Malbec”: EL CASTIGO 750 ml + tabla de fiambres + danbo/cremoso -10%.
  - “Hidratación semanal”: 2x agua 6 L + 6x 500 cc + 2x soda 2 L con descuento escalonado.
- Promos
  - Bebidas: 70% en la segunda unidad combinable Zero/regular; 3x2 en importadas fines de semana.
  - Básicos: precio redondo y cartel de precio por kilo/litro en azúcar, sal, tomate, pasta.
- Surtido
  - Mantener premium cheese con tope de SKUs (2-3 referencias de alta rotación) y ampliar quesos masivos.
  - Introducir formatos pequeños en aceite para ticket accesible y “precio ancla” con private label.

4) **Priorización por impacto**

| Recomendación                                   | Plazo        | Impacto | Esfuerzo | Justificación breve                                         |
| Reforzar stock/facing de top sellers            | Inmediato    | Alto    | Bajo     | Evita quiebres en SKUs que traccionan tráfico y ticket.     |
| Depuración de datos críticos (SKUs/fechas)      | Inmediato    | Alto    | Medio    | Mejora decisiones y evita errores de precio/inventario.     |
| Promos mix & match en gaseosas (Zero/regular)   | Inmediato    | Alto    | Bajo     | Aumenta unidades por ticket y share del pasillo bebidas.    |
| Bundles “comidas completas” (pasta/picada)      | Inmediato    | Medio   | Bajo     | Eleva ticket y rotación cruzada sin ampliar surtido.        |
| Negociar mecánicas con proveedores clave        | Mediano      | Alto    | Medio    | Financia promos agresivas (70% 2ª, 3x2) y asegura cupos.    |
| Escalera de precios en aceite y básicos         | Mediano      | Alto    | Medio    | Captura trade-down sin perder margen ni volumen.            |
| Optimización surtido quesos (premium vs masivo) | Mediano      | Medio   | Medio    | Mejora margen mix y reduce quiebres en alta rotación.       |
| Packs retornables y multipacks                  | Mediano      | Medio   | Bajo     | Mejora valor percibido y frecuencia de compra.              |
| Omnicanal: combos y suscripción de aguas        | Mediano      | Medio   | Medio    | Incrementa recurrencia y simplifica reposición del hogar.   |
| Tablero de margen y alertas de anomalías        | Mediano      | Medio   | Medio    | Sustenta pricing/promos y control de pérdidas.              |

5) **Riesgos, alertas o problemas de datos**
- Fechas inconsistentes (período “Desde 15/0/2026 hasta 20/0/2025”) y posible corte de ventana.
- Valores atípicos: burrata con facturación desproporcionada vs unidades; línea “ART. VARIOS” con ventas negativas; decimales y separadores confusos.
- Nomenclatura duplicada/errónea (Graziani/Grazimne, Coca “vid ret” vs estándar), riesgo de SKUs duplicados y pricing incoherente.
- Ausencia de costos/margen y de cobertura por sucursal/vendedor; no se valida si “todas las sucursales” es efectivo.
- OCR del origen de datos: riesgo de interpretaciones erróneas; requerir ver fuente nativa o exportación limpia.

6) **Contraste con tendencias y mecánicas de retailers líderes** (Argentina > Tendencias argentinas > Qué se consume hoy)
- Canasta barbell: líderes (Carrefour, Cencosud, Coto, Día) combinan agresividad promo en básicos y bebidas con curaduría premium de fin de semana. El mix observado (básicos + indulgencia) está alineado.
- Mecánicas habituales: 70% en la 2ª unidad / 3x2 en bebidas, “mix & match” entre variantes (Zero/regular), packs retornables con precio por litro destacado. Recomendado aplicarlas tal cual al pasillo bebidas.
- Private label/value: fuerte empuje en azúcar, pastas, tomate, sal para contener ticket. Sugerido ampliar alternativas value junto a líderes de marca.
- Quesos y deli: retailers premium (Jumbo/Disco) mantienen surtido corto de quesos especiales con alta exhibición de fin de semana. La presencia de burrata/bocconcino sugiere seguir ese modelo con control de SKU count.
- Omnicanal: combos temáticos en marketplaces y quick commerce (“pasta night”, “asado/picada”), y suscripciones de agua. Replicar para elevar recurrencia.

7) **Resumen preciso**
- Qué se consume hoy: básicos de cocina (aceite líder, azúcar, pastas, tomate), bebidas en todas sus variantes (aguas, sodas, gaseosas regular/Zero, cervezas importadas) y un bloque de indulgencia/premium (vino Malbec top, quesos especiales y picadas).
- Dónde actuar ya: evitar quiebres en top sellers, activar promos en bebidas (mix & match, retornables), bundles de “comidas completas” y corrección urgente de datos anómalos.
- Dónde construir valor: escalera de precios y private label en básicos; curaduría corta y rentable en quesos/deli; negociación con proveedores para financiar mecánicas líderes; packs y omnicanal para incrementar ticket y frecuencia.`,
            },
        };
    },
    mounted() {
        this.isLoggedIn = localStorage.getItem('token') ? true : false;
    },
    methods: {
        parseMarkdown(text) {
            if (!text) return '';

            // Normaliza todas las tablas Markdown del texto
            text = text.replace(
                // Busca bloques de tabla (al menos 2 filas)
                /((?:\|[^\n]+\|\s*\n){2,})/g,
                (block) => {
                    // Quita líneas vacías y separadores extra
                    let lines = block
                        .split('\n')
                        .map((l) => l.trim())
                        .filter((l) => l.length > 0 && !/^(\|\s*-+\s*)+\|$/.test(l));
                    if (lines.length < 2) return block; // No es tabla válida

                    // Inserta separador después del encabezado
                    const cols = lines[0].split('|').length - 2;
                    const separator = '|' + Array(cols).fill('---').join('|') + '|';
                    lines.splice(1, 0, separator);

                    return '\n' + lines.join('\n') + '\n';
                }
            );

            return marked.parse(text);
        },
        logout() {
            localStorage.removeItem('token');
            location.reload();
        },
        mostrarEjemplo(nivel) {
            this.nivelSeleccionado = nivel
            this.showModal = true
        },
        cerrarModal() {
            this.showModal = false
            this.nivelSeleccionado = null
        },
    },
    computed: {
        textoEjemplo() {
            return (
                this.ejemplos[this.nivelSeleccionado] ||
                "Información no disponible."
            )
        },
        analisisHtml(texto) {
            // Convierte el texto plano a HTML usando marked
            return marked.parse(texto);
        },
    },
}
</script>
