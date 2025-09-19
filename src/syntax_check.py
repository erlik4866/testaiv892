"""
FiveM Lua kodu için sözdizimi kontrol modülü.
Yazılan kodun temel sözdizimi hatalarını tespit eder.
"""

import re

def check_syntax(lua_code):
    errors = []

    # Basit parantez kontrolü
    open_parens = lua_code.count('(')
    close_parens = lua_code.count(')')
    if open_parens != close_parens:
        errors.append("Parantez sayısı eşleşmiyor.")

    # Basit yorum satırı kontrolü
    if re.search(r'--\[\[.*?--\]\]', lua_code, re.DOTALL):
        errors.append("Yorum satırı formatı hatalı olabilir.")

    # Örnek: Fonksiyon tanımı kontrolü
    if not re.search(r'function\s+\w+\s*\(.*\)', lua_code):
        errors.append("Fonksiyon tanımı bulunamadı veya hatalı.")

    return errors

# Örnek kullanım
if __name__ == "__main__":
    sample_code = """
    Citizen.CreateThread(function()
        print("Hello World")
    end)
    """
    syntax_errors = check_syntax(sample_code)
    if syntax_errors:
        print("Sözdizimi hataları:")
        for err in syntax_errors:
            print("-", err)
    else:
        print("Sözdizimi hatası bulunamadı.")
