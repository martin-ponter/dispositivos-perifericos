export const BITRIX_APP_CONFIG = {
  // Sustituye esto por el ENTITY_TYPE_ID real del SPA cuando lo tengas.
  // Ejemplo: 1058, 1072, etc.
  ENTITY_TYPE_ID: 1062,

  APP_ADMIN_IDS: [541],

  FIELDS: {
  ID_INTERNO: "ufCrm23_1775560845",
  TIPO_ACTIVO: "ufCrm23_1775560905",
  VINCULADO_A: "ufCrm23_1775560973",
  ESTADO: "ufCrm23_1775560990",
  FECHA_REGISTRO: "ufCrm23_1775561036",
  UBICACION_FISICA: "ufCrm23_1775561060",
  NUMERO_SERIE: "ufCrm23_1775561073",
  MARCA: "ufCrm23_1775561101",
  MODELO: "ufCrm23_1775561130",
  FACTURA: "ufCrm23_1775561140",
  FACTURA_ARCHIVO: "ufCrm23_1775570620",
  OBSERVACIONES: "ufCrm23_1775561147",
  SISTEMA_OPERATIVO: "ufCrm23_1775561292",
  MEMORIA_RAM: "ufCrm23_1775561305",
  TIPO_CONECTOR: "ufCrm23_1775561325",
},

  ENUMS: {
    TIPO_ACTIVO: {
      Portatil: "4814",
      Sobremesa: "4815",
      Monitor: "4816",
      Teclado: "4817",
      Raton: "4818",
      Cascos: "4819",
      Cable: "4820",
      Adaptador: "4821",
      Otro: "4822",
    },
    ESTADO: {
      Disponible: "4823",
      Ocupado: "4824",
      Desechado: "4825",
      EnReparacion: "4826",
    },
  },

  DEFAULTS: {
    ESTADO: "4823",
  },
};