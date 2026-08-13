# Luxor Plataforma digital para la gestión y exposición de vehículos de lujo

Estado: Finalizado
Sector: Automoción
Tipo: Cliente real
URL: https://luxor-kohl.vercel.app/

# Contexto del proyecto

En lugar de crear una web corporativa tradicional, el objetivo era construir una experiencia digital que transmitiera exclusividad y facilitara la gestión diaria del catálogo.

El proyecto debía cubrir dos necesidades:

- ofrecer una presentación premium de los vehículos;
- permitir que el propietario pudiera añadir, editar o eliminar vehículos de forma autónoma.

---

# Objetivo del proyecto

Diseñar y desarrollar una plataforma moderna para un concesionario de vehículos de lujo que combinara una experiencia visual cuidada con un sistema de gestión sencillo para el cliente.

---

# Retos del proyecto

Durante el desarrollo aparecieron varios retos interesantes.

### Experiencia premium

El diseño debía transmitir exclusividad sin sobrecargar la interfaz.

---

### Gestión autónoma

El cliente necesitaba actualizar el catálogo sin conocimientos técnicos.

Para ello desarrollé un panel de administración protegido mediante autenticación.

---

### Gestión de imágenes

Las imágenes tenían un papel protagonista.

Se integró un servicio externo para facilitar su gestión y mantener un buen rendimiento.

---

### Arquitectura

Era mi primer proyecto de cierta envergadura.

Desde el principio intenté separar correctamente:

- componentes
- páginas
- servicios
- modelos

Eso hizo que el proyecto fuese mucho más mantenible.

---

# Solución implementada

La aplicación incluye:

### Landing principal

Presentación del concesionario.

---

### Catálogo de vehículos

Listado dinámico de coches disponibles.

---

### Ficha individual

Cada vehículo dispone de su propia página con toda la información relevante.

---

### Login privado

Sistema de autenticación para acceder al panel de administración.

---

### Panel de administración

Gestión completa del catálogo.

Crear vehículos.

Editar información.

Eliminar vehículos.

Actualizar imágenes.

---

### Base de datos

Persistencia de toda la información mediante Firebase.

---

# Tecnologías utilizadas

He visto que utilizaste:

- React
- Vite
- React Router
- Firebase Authentication
- Firestore
- Cloudinary
- Framer Motion
- Lucide Icons

Y, algo que también suma, una organización bastante limpia del proyecto con servicios separados (`carService`, `firebase`, `cloudinaryService`), rutas, componentes reutilizables y páginas independientes.

---

# Lo que aprendí

Esta sección no la pondría en los demás proyectos.

Pero aquí sí.

Porque es tu primer proyecto real.

Podría decir algo así:

> Luxor fue el proyecto en el que entendí que diseñar una interfaz es solo una parte del trabajo. Una buena solución digital también debe facilitar la gestión diaria del negocio y ser mantenible a largo plazo. Este proyecto marcó el inicio de mi forma de entender los ecosistemas digitales: combinar diseño, tecnología y funcionalidad para resolver necesidades reales.
> 

Creo que esa reflexión conecta perfectamente con el posicionamiento que estamos construyendo hoy.

---

# Impacto esperado

- Gestión autónoma del catálogo.
- Imagen de marca más sólida.
- Mejor experiencia para los usuarios.
- Base tecnológica preparada para futuras ampliaciones.