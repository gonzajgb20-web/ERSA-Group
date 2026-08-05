/**
 * ERSA Group - Control de Mantenimiento de Aceite
 * Lógica JavaScript con interfaz sobria e integración del campo Marca
 */

document.addEventListener('DOMContentLoaded', () => {
    initBuscador();
    initModalCambioAceite();
    initAccionesGestion();
});

/**
 * Buscador en tiempo real por número de interno
 */
function initBuscador() {
    const searchInput = document.getElementById('searchInterno');
    const tarjetas = document.querySelectorAll('.interno-card');
    const contadorVisibles = document.getElementById('visibleCount');
    const cajaVacia = document.getElementById('emptyState');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const busqueda = e.target.value.trim().toLowerCase();
        let encontrados = 0;

        tarjetas.forEach(card => {
            const numero = card.getAttribute('data-numero') || '';
            if (numero.toLowerCase().includes(busqueda)) {
                card.style.display = 'flex';
                encontrados++;
            } else {
                card.style.display = 'none';
            }
        });

        if (contadorVisibles) {
            contadorVisibles.textContent = encontrados;
        }

        if (cajaVacia) {
            cajaVacia.style.display = (encontrados === 0) ? 'block' : 'none';
        }
    });
}

/**
 * Manejo de la ventana modal para registrar cambio de aceite
 */
function initModalCambioAceite() {
    const modal = document.getElementById('modalCambioAceite');
    if (!modal) return;

    const form = document.getElementById('formCambioAceite');
    const btnCancelar = document.getElementById('btnCancelarModal');
    const btnCerrar = modal.querySelector('.btn-cerrar-modal');
    
    // Campos del formulario
    const inputInternoId = document.getElementById('modal_interno_id');
    const displayNumeroInterno = document.getElementById('modal_display_numero');
    const inputFecha = document.getElementById('modal_fecha_cambio');
    const inputKm = document.getElementById('modal_kilometraje');
    const inputMecanicos = document.getElementById('modal_mecanicos');

    document.querySelectorAll('.btn-open-modal').forEach(boton => {
        boton.addEventListener('click', () => {
            const internoId = boton.getAttribute('data-id');
            const numeroInterno = boton.getAttribute('data-numero');
            const ultimoKm = boton.getAttribute('data-ultimo-km') || '';

            inputInternoId.value = internoId;
            displayNumeroInterno.textContent = numeroInterno;
            
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.value = hoy;

            inputKm.value = '';
            if (ultimoKm && parseInt(ultimoKm) > 0) {
                inputKm.placeholder = `Sugerido > ${parseInt(ultimoKm)} Km`;
            } else {
                inputKm.placeholder = "Ingrese el kilometraje";
            }
            
            inputMecanicos.value = '';

            abrirModal(modal);
        });
    });

    if (btnCancelar) btnCancelar.addEventListener('click', () => cerrarModal(modal));
    if (btnCerrar) btnCerrar.addEventListener('click', () => cerrarModal(modal));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal(modal);
    });

    // Envío del formulario vía Fetch
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const textoOriginal = submitBtn.innerHTML;
            
            const kmVal = parseInt(inputKm.value.trim());
            if (isNaN(kmVal) || kmVal <= 0) {
                mostrarNotificacion('Por favor ingrese un kilometraje válido mayor a 0.', 'error');
                inputKm.focus();
                return;
            }

            if (!inputMecanicos.value.trim()) {
                mostrarNotificacion('Por favor especifique al menos un mecánico responsable.', 'error');
                inputMecanicos.focus();
                return;
            }

            const datos = {
                interno_id: inputInternoId.value,
                fecha_cambio: inputFecha.value,
                kilometraje: kmVal,
                mecanicos: inputMecanicos.value.trim()
            };

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Guardando...';

                const respuesta = await fetch('guardar_cambio.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    mostrarNotificacion(`Cambio de aceite registrado correctamente para el Interno N° ${resultado.data.numero_interno}`, 'exito');
                    cerrarModal(modal);
                    setTimeout(() => window.location.reload(), 1100);
                } else {
                    mostrarNotificacion(resultado.error || 'No se pudo guardar el registro.', 'error');
                }

            } catch (err) {
                console.error(err);
                mostrarNotificacion('Error de red o servidor al procesar la solicitud.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = textoOriginal;
            }
        });
    }
}

/**
 * Gestión de Colectivos (Agregar y Eliminar con marca)
 */
function initAccionesGestion() {
    const formAgregar = document.getElementById('formAgregarInterno');
    if (formAgregar) {
        formAgregar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputNumero = document.getElementById('nuevo_numero_interno');
            const inputMarca = document.getElementById('nuevo_marca');
            
            const numeroVal = inputNumero.value.trim();
            const marcaVal = inputMarca ? inputMarca.value.trim() : 'Volkswagen';

            if (!numeroVal) {
                mostrarNotificacion('Por favor ingrese un número de interno.', 'error');
                return;
            }

            try {
                const respuesta = await fetch('gestion_interno.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accion: 'agregar',
                        numero_interno: numeroVal,
                        marca: marcaVal
                    })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    mostrarNotificacion(`Interno N° ${numeroVal} (${marcaVal}) agregado con éxito a la flota.`, 'exito');
                    inputNumero.value = '';
                    if (inputMarca) inputMarca.value = 'Volkswagen';
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    mostrarNotificacion(resultado.error || 'No se pudo agregar el interno.', 'error');
                }
            } catch (err) {
                console.error(err);
                mostrarNotificacion('Error de servidor al agregar el interno.', 'error');
            }
        });
    }

    // Botones de eliminación
    document.querySelectorAll('.btn-eliminar-interno').forEach(boton => {
        boton.addEventListener('click', async () => {
            const id = boton.getAttribute('data-id');
            const numero = boton.getAttribute('data-numero');

            if (!confirm(`¿Está seguro de que desea eliminar el Interno N° ${numero} de la flota?\nEsta acción eliminará también su historial de mantenimiento.`)) {
                return;
            }

            try {
                const respuesta = await fetch('gestion_interno.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accion: 'eliminar',
                        id: id
                    })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    mostrarNotificacion(`El Interno N° ${numero} fue eliminado del sistema.`, 'exito');
                    const fila = boton.closest('tr');
                    if (fila) fila.remove();
                } else {
                    mostrarNotificacion(resultado.error || 'No se pudo eliminar el colectivo.', 'error');
                }
            } catch (err) {
                console.error(err);
                mostrarNotificacion('Error al procesar la eliminación.', 'error');
            }
        });
    });
}

function abrirModal(modal) {
    modal.classList.add('active');
}

function cerrarModal(modal) {
    modal.classList.remove('active');
}

/**
 * Notificaciones flotantes en pantalla
 */
function mostrarNotificacion(mensaje, tipo = 'exito') {
    let contenedor = document.querySelector('.toast-container');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.className = 'toast-container';
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    const svgIcono = (tipo === 'exito') 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    toast.innerHTML = `${svgIcono} <span>${mensaje}</span>`;

    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
