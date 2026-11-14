/* ============================================================
   CONFIGURACIÓN DE LA DEMO
   Es el único archivo que necesitas tocar antes de publicar.
   ============================================================ */
window.CONFIG = {
  // Tu número de WhatsApp con código de país, solo dígitos (ej. 584121234567)
  whatsapp: "+584244548687",

  // Mensaje que se escribe solo cuando alguien toca "Lo quiero en mi taller"
  mensaje: "Hola, probé la demo de AdminVV Taller y quiero saber más.",

  // Nombre del taller de ejemplo y símbolo de moneda
  taller: "Taller Ruiz",
  moneda: "$",

  // Dominio que aparece en el enlace de ejemplo que "recibe" el cliente
  dominioEjemplo: "adminvv.app",

  // Repuestos y servicios que aparecen como botones en el presupuesto
  catalogo: [
    ["Pastillas de freno", 45],
    ["Mano de obra (1 h)", 25],
    ["Cambio de aceite", 35],
    ["Discos de freno", 80],
    ["Batería", 95],
    ["Alineación", 20]
  ],

  // Carros que ya aparecen cargados en el tablero
  // estado: espera | reparacion | listo      pres: borrador | enviado | aprobado
  ordenes: [
    { placa: "AB123CD", vehiculo: "Toyota Yaris 2018", cliente: "Carlos Pérez", motivo: "Cambio de aceite",
      lineas: [["Cambio de aceite", 35], ["Mano de obra (1 h)", 25]], estado: "listo", pres: "aprobado" },
    { placa: "AE742GH", vehiculo: "Volkswagen Gol 2016", cliente: "María Rodríguez", motivo: "Embrague",
      lineas: [["Kit de embrague", 180], ["Mano de obra (3 h)", 75]], estado: "reparacion", pres: "aprobado" },
    { placa: "AC551KL", vehiculo: "Chevrolet Aveo 2014", cliente: "José Hernández", motivo: "Ruido al frenar",
      lineas: [["Pastillas de freno", 45], ["Mano de obra (1 h)", 25]], estado: "espera", pres: "enviado" },
    { placa: "AF208MN", vehiculo: "Ford Fiesta 2015", cliente: "Ana Gutiérrez", motivo: "Revisión general",
      lineas: [], estado: "espera", pres: "borrador" }
  ]
};
