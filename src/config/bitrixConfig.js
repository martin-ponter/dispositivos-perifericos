export const BITRIX_APP_CONFIG = {
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

  HISTORY: {
    ENTITY_TYPE_ID: 1066,
    FIELDS: {
      ID_INTERNO_ACTIVO: "ufCrm24_1775631676",
      ID_ITEM_ACTIVO: "ufCrm24_1775631706",
      NUMERO_SERIE: "ufCrm24_1775631768",
      MARCA: "ufCrm24_1775631798",
      MODELO: "ufCrm24_1775631805",
      TIPO_ACTIVO: "ufCrm24_1775632573",
      TIPO_MOVIMIENTO: "ufCrm24_1775631834",
      USUARIO_ANTERIOR: "ufCrm24_1775631926",
      USUARIO_NUEVO: "ufCrm24_1775631961",
      REALIZADO_POR: "ufCrm24_1775631978",
      ESTADO_ANTERIOR: "ufCrm24_1775632004",
      ESTADO_NUEVO: "ufCrm24_1775632052",
      UBICACION_ANTERIOR: "ufCrm24_1775632117",
      UBICACION_NUEVA: "ufCrm24_1775632134",
      FECHA_MOVIMIENTO: "ufCrm24_1775632146",
      HORA_MOVIMIENTO: "ufCrm24_1775632166",
      DETALLE: "ufCrm24_1775632193",
    },
    ENUMS: {
      TIPO_ACTIVO: {
        Portatil: "4842",
        Sobremesa: "4843",
        Monitor: "4844",
        Teclado: "4845",
        Raton: "4846",
        Cascos: "4847",
        Cable: "4848",
        Adaptador: "4849",
        Otro: "4850",
      },
      TIPO_MOVIMIENTO: {
        Alta: "4827",
        Edicion: "4828",
        Reasignacion: "4829",
        CambioEstado: "4830",
        CambioUbicacion: "4831",
        FacturaAnadida: "4832",
        FacturaReemplazada: "4833",
      },
      ESTADO_ANTERIOR: {
        Disponible: "4834",
        Ocupado: "4835",
        Desechado: "4836",
        EnReparacion: "4837",
      },
      ESTADO_NUEVO: {
        Disponible: "4838",
        Ocupado: "4839",
        Desechado: "4840",
        EnReparacion: "4841",
      },
    },
  },

  DEFAULTS: {
    ESTADO: "4823",
  },
};

BITRIX_APP_CONFIG.ENUM_LABELS = {
  TIPO_ACTIVO: {
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Portatil]: "Portatil",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Sobremesa]: "Sobremesa",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Monitor]: "Monitor",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Teclado]: "Teclado",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Raton]: "Raton",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Cascos]: "Cascos",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Cable]: "Cable",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Adaptador]: "Adaptador",
    [BITRIX_APP_CONFIG.ENUMS.TIPO_ACTIVO.Otro]: "Otro",
  },
  ESTADO: {
    [BITRIX_APP_CONFIG.ENUMS.ESTADO.Disponible]: "Disponible",
    [BITRIX_APP_CONFIG.ENUMS.ESTADO.Ocupado]: "Ocupado",
    [BITRIX_APP_CONFIG.ENUMS.ESTADO.Desechado]: "Desechado",
    [BITRIX_APP_CONFIG.ENUMS.ESTADO.EnReparacion]: "En reparacion",
  },
};

BITRIX_APP_CONFIG.ENUM_OPTIONS = {
  TIPO_ACTIVO: Object.entries(BITRIX_APP_CONFIG.ENUM_LABELS.TIPO_ACTIVO).map(
    ([value, label]) => ({ value, label })
  ),
  ESTADO: Object.entries(BITRIX_APP_CONFIG.ENUM_LABELS.ESTADO).map(
    ([value, label]) => ({ value, label })
  ),
};

BITRIX_APP_CONFIG.HISTORY.ENUM_LABELS = {
  TIPO_ACTIVO: {
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Portatil]: "Portatil",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Sobremesa]: "Sobremesa",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Monitor]: "Monitor",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Teclado]: "Teclado",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Raton]: "Raton",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Cascos]: "Cascos",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Cable]: "Cable",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Adaptador]: "Adaptador",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_ACTIVO.Otro]: "Otro",
  },
  TIPO_MOVIMIENTO: {
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.Alta]: "Alta",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.Edicion]: "Edicion",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.Reasignacion]: "Reasignacion",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.CambioEstado]:
      "Cambio de estado",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.CambioUbicacion]:
      "Cambio de ubicacion",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.FacturaAnadida]:
      "Factura anadida",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.TIPO_MOVIMIENTO.FacturaReemplazada]:
      "Factura reemplazada",
  },
  ESTADO_ANTERIOR: {
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.Disponible]: "Disponible",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.Ocupado]: "Ocupado",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.Desechado]: "Desechado",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.EnReparacion]:
      "En reparacion",
  },
  ESTADO_NUEVO: {
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.Disponible]: "Disponible",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.Ocupado]: "Ocupado",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.Desechado]: "Desechado",
    [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.EnReparacion]:
      "En reparacion",
  },
};

BITRIX_APP_CONFIG.HISTORY.STATE_LABELS = {
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.Disponible]: "Disponible",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.Ocupado]: "Ocupado",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.Desechado]: "Desechado",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_ANTERIOR.EnReparacion]:
    "En reparacion",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.Disponible]: "Disponible",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.Ocupado]: "Ocupado",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.Desechado]: "Desechado",
  [BITRIX_APP_CONFIG.HISTORY.ENUMS.ESTADO_NUEVO.EnReparacion]:
    "En reparacion",
};
