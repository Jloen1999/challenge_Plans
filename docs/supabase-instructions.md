# Ejecutar script SQL en Supabase

## Usando el Editor SQL

2. **Abre el Editor SQL**
   - En el menú lateral, haz clic en "SQL Editor"
   - Crea una "Nueva consulta" haciendo clic en el botón correspondiente

3. **Modifica tu script SQL para solucionar el problema de referencias circulares**
   - Hay una referencia circular en tu script: la tabla `retos` hace referencia a `planes_estudio` antes de que esta última exista
   - Solución: Reordena las tablas o añade las restricciones de clave foránea después

4. **Ejecuta el [script](/backend/createDB.sql)**
   - Haz clic en "Ejecutar" o presiona Ctrl+Enter
