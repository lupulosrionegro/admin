CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "hileras" (
	"id" serial PRIMARY KEY NOT NULL,
	"variedad_id" integer,
	"variedad_a_id" integer,
	"variedad_b_id" integer,
	"split" boolean DEFAULT false NOT NULL,
	"poste" text,
	"plantas" integer,
	"lat1" real NOT NULL,
	"lng1" real NOT NULL,
	"lat2" real NOT NULL,
	"lng2" real NOT NULL,
	"longitud_m" real NOT NULL,
	"ancho_m" real DEFAULT 2.5 NOT NULL,
	"anio" integer DEFAULT 2024 NOT NULL,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lecturas_sensor" (
	"id" serial PRIMARY KEY NOT NULL,
	"lote_id" integer,
	"sensor_id" text NOT NULL,
	"humedad" real NOT NULL,
	"temperatura" real,
	"variedad_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_lote" text NOT NULL,
	"variedad_id" integer NOT NULL,
	"humedad" real NOT NULL,
	"temperatura" real,
	"peso_gramos" integer,
	"cosecha" integer,
	"sensor_id" text,
	"foto_url" text,
	"lab_pdf_url" text,
	"qr_url" text,
	"publicado" boolean DEFAULT false NOT NULL,
	"fecha_envasado" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lotes_numero_lote_unique" UNIQUE("numero_lote")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "variedades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hileras" ADD CONSTRAINT "hileras_variedad_id_variedades_id_fk" FOREIGN KEY ("variedad_id") REFERENCES "public"."variedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hileras" ADD CONSTRAINT "hileras_variedad_a_id_variedades_id_fk" FOREIGN KEY ("variedad_a_id") REFERENCES "public"."variedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hileras" ADD CONSTRAINT "hileras_variedad_b_id_variedades_id_fk" FOREIGN KEY ("variedad_b_id") REFERENCES "public"."variedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturas_sensor" ADD CONSTRAINT "lecturas_sensor_lote_id_lotes_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturas_sensor" ADD CONSTRAINT "lecturas_sensor_variedad_id_variedades_id_fk" FOREIGN KEY ("variedad_id") REFERENCES "public"."variedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_variedad_id_variedades_id_fk" FOREIGN KEY ("variedad_id") REFERENCES "public"."variedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;