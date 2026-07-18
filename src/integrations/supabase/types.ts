export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          age: number
          body_fat_pct: number | null
          calculation_date: string
          client_id: string
          created_at: string
          get_calculation_method: Database["public"]["Enums"]["calc_method"]
          height_cm: number
          id: string
          muscle_mass_kg: number | null
          nutrition_goal: Database["public"]["Enums"]["nutrition_goal"]
          org_id: string
          physical_activity_level: Database["public"]["Enums"]["activity_level"]
          raw_payload: Json | null
          sex: Database["public"]["Enums"]["sex_type"]
          source: string
          updated_at: string
          visceral_fat: number | null
          weight_kg: number
        }
        Insert: {
          age: number
          body_fat_pct?: number | null
          calculation_date?: string
          client_id: string
          created_at?: string
          get_calculation_method?: Database["public"]["Enums"]["calc_method"]
          height_cm: number
          id?: string
          muscle_mass_kg?: number | null
          nutrition_goal?: Database["public"]["Enums"]["nutrition_goal"]
          org_id: string
          physical_activity_level?: Database["public"]["Enums"]["activity_level"]
          raw_payload?: Json | null
          sex: Database["public"]["Enums"]["sex_type"]
          source?: string
          updated_at?: string
          visceral_fat?: number | null
          weight_kg: number
        }
        Update: {
          age?: number
          body_fat_pct?: number | null
          calculation_date?: string
          client_id?: string
          created_at?: string
          get_calculation_method?: Database["public"]["Enums"]["calc_method"]
          height_cm?: number
          id?: string
          muscle_mass_kg?: number | null
          nutrition_goal?: Database["public"]["Enums"]["nutrition_goal"]
          org_id?: string
          physical_activity_level?: Database["public"]["Enums"]["activity_level"]
          raw_payload?: Json | null
          sex?: Database["public"]["Enums"]["sex_type"]
          source?: string
          updated_at?: string
          visceral_fat?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          external_id: string | null
          full_name: string
          id: string
          notes: string | null
          org_id: string
          phone: string | null
          sex: Database["public"]["Enums"]["sex_type"] | null
          trainer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          full_name: string
          id?: string
          notes?: string | null
          org_id: string
          phone?: string | null
          sex?: Database["public"]["Enums"]["sex_type"] | null
          trainer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          sex?: Database["public"]["Enums"]["sex_type"] | null
          trainer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          allergens: string[] | null
          calcium_mg_per_100g: number | null
          carbs_g_per_100g: number
          category: string | null
          created_at: string
          fat_g_per_100g: number
          fiber_g_per_100g: number | null
          id: string
          iron_mg_per_100g: number | null
          is_active: boolean
          kcal_per_100g: number
          name: string
          name_es: string | null
          potassium_mg_per_100g: number | null
          protein_g_per_100g: number
          sodium_mg_per_100g: number | null
          source: Database["public"]["Enums"]["food_source"]
          source_code: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          calcium_mg_per_100g?: number | null
          carbs_g_per_100g?: number
          category?: string | null
          created_at?: string
          fat_g_per_100g?: number
          fiber_g_per_100g?: number | null
          id?: string
          iron_mg_per_100g?: number | null
          is_active?: boolean
          kcal_per_100g: number
          name: string
          name_es?: string | null
          potassium_mg_per_100g?: number | null
          protein_g_per_100g?: number
          sodium_mg_per_100g?: number | null
          source?: Database["public"]["Enums"]["food_source"]
          source_code?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          calcium_mg_per_100g?: number | null
          carbs_g_per_100g?: number
          category?: string | null
          created_at?: string
          fat_g_per_100g?: number
          fiber_g_per_100g?: number | null
          id?: string
          iron_mg_per_100g?: number | null
          is_active?: boolean
          kcal_per_100g?: number
          name?: string
          name_es?: string | null
          potassium_mg_per_100g?: number | null
          protein_g_per_100g?: number
          sodium_mg_per_100g?: number | null
          source?: Database["public"]["Enums"]["food_source"]
          source_code?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      menu_slot_options: {
        Row: {
          created_at: string
          id: string
          option_kcal: number | null
          order_index: number
          recipe_id: string
          serving_grams: number | null
          slot_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_kcal?: number | null
          order_index?: number
          recipe_id: string
          serving_grams?: number | null
          slot_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_kcal?: number | null
          order_index?: number
          recipe_id?: string
          serving_grams?: number | null
          slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_slot_options_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_slot_options_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "menu_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_slots: {
        Row: {
          created_at: string
          id: string
          menu_id: string
          name: string
          order_index: number
          slot_type: Database["public"]["Enums"]["meal_slot_type"]
          target_kcal: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu_id: string
          name: string
          order_index?: number
          slot_type: Database["public"]["Enums"]["meal_slot_type"]
          target_kcal?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          menu_id?: string
          name?: string
          order_index?: number
          slot_type?: Database["public"]["Enums"]["meal_slot_type"]
          target_kcal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_slots_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          kcal_level: number
          name: string
          tags: string[] | null
          total_carbs_g: number
          total_fat_g: number
          total_fiber_g: number | null
          total_kcal: number
          total_protein_g: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kcal_level: number
          name: string
          tags?: string[] | null
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number | null
          total_kcal: number
          total_protein_g?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kcal_level?: number
          name?: string
          tags?: string[] | null
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number | null
          total_kcal?: number
          total_protein_g?: number
          updated_at?: string
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          ai_model: string | null
          assessment_id: string | null
          assigned_menu_kcal: number | null
          calcium_mg: number | null
          carbs_g: number | null
          client_id: string
          created_at: string
          disclaimer: string
          fat_g: number | null
          fiber_g: number | null
          generated_by: string | null
          id: string
          iron_mg: number | null
          meal_distribution: Json
          menu_id: string | null
          menu_name: string | null
          observations: string | null
          org_id: string
          potassium_mg: number | null
          protein_g: number | null
          share_id: string
          shopping_list: Json
          sodium_mg: number | null
          status: string
          target_kcal: number
          updated_at: string
          version: number
          water_ml: number | null
        }
        Insert: {
          ai_model?: string | null
          assessment_id?: string | null
          assigned_menu_kcal?: number | null
          calcium_mg?: number | null
          carbs_g?: number | null
          client_id: string
          created_at?: string
          disclaimer?: string
          fat_g?: number | null
          fiber_g?: number | null
          generated_by?: string | null
          id?: string
          iron_mg?: number | null
          meal_distribution?: Json
          menu_id?: string | null
          menu_name?: string | null
          observations?: string | null
          org_id: string
          potassium_mg?: number | null
          protein_g?: number | null
          share_id?: string
          shopping_list?: Json
          sodium_mg?: number | null
          status?: string
          target_kcal: number
          updated_at?: string
          version?: number
          water_ml?: number | null
        }
        Update: {
          ai_model?: string | null
          assessment_id?: string | null
          assigned_menu_kcal?: number | null
          calcium_mg?: number | null
          carbs_g?: number | null
          client_id?: string
          created_at?: string
          disclaimer?: string
          fat_g?: number | null
          fiber_g?: number | null
          generated_by?: string | null
          id?: string
          iron_mg?: number | null
          meal_distribution?: Json
          menu_id?: string | null
          menu_name?: string | null
          observations?: string | null
          org_id?: string
          potassium_mg?: number | null
          protein_g?: number | null
          share_id?: string
          shopping_list?: Json
          sodium_mg?: number | null
          status?: string
          target_kcal?: number
          updated_at?: string
          version?: number
          water_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding: Json
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          branding?: Json
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          branding?: Json
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          org_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          org_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          org_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          food_id: string
          grams: number
          id: string
          notes: string | null
          order_index: number
          recipe_id: string
        }
        Insert: {
          created_at?: string
          food_id: string
          grams: number
          id?: string
          notes?: string | null
          order_index?: number
          recipe_id: string
        }
        Update: {
          created_at?: string
          food_id?: string
          grams?: number
          id?: string
          notes?: string | null
          order_index?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergens: string[] | null
          cook_time_min: number | null
          cost_estimate: number | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["recipe_difficulty"]
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean
          name: string
          prep_time_min: number | null
          servings: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          cook_time_min?: number | null
          cost_estimate?: number | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean
          name: string
          prep_time_min?: number | null
          servings?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          cook_time_min?: number | null
          cost_estimate?: number | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean
          name?: string
          prep_time_min?: number | null
          servings?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_in_org: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_level:
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active"
      app_role: "super_admin" | "gym_admin" | "trainer" | "client"
      calc_method: "mifflin_st_jeor" | "katch_mcardle" | "harris_benedict"
      food_source: "usda" | "fao" | "bedca" | "ecuador" | "custom"
      meal_slot_type:
        | "breakfast"
        | "mid_morning"
        | "lunch"
        | "snack"
        | "dinner"
        | "post_workout"
        | "pre_workout"
      nutrition_goal: "lose_fat" | "maintain" | "gain_muscle"
      recipe_difficulty: "easy" | "medium" | "hard"
      sex_type: "male" | "female"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_level: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
      app_role: ["super_admin", "gym_admin", "trainer", "client"],
      calc_method: ["mifflin_st_jeor", "katch_mcardle", "harris_benedict"],
      food_source: ["usda", "fao", "bedca", "ecuador", "custom"],
      meal_slot_type: [
        "breakfast",
        "mid_morning",
        "lunch",
        "snack",
        "dinner",
        "post_workout",
        "pre_workout",
      ],
      nutrition_goal: ["lose_fat", "maintain", "gain_muscle"],
      recipe_difficulty: ["easy", "medium", "hard"],
      sex_type: ["male", "female"],
    },
  },
} as const
