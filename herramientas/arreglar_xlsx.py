#!/usr/bin/env python3
"""Deja un .xlsx hecho con openpyxl listo para que Excel NO pida "reparar": pasa los textos a sharedStrings y quita <definedNames/> vacío.

Uso: python3 herramientas/arreglar_xlsx.py ARCHIVO.xlsx [SALIDA.xlsx]   (sin SALIDA, reemplaza el archivo)
Además, al CREAR tablas con openpyxl: el ancho de `ref` debe ser igual al número de columnas de la tabla, todas las celdas de encabezado deben
tener texto único, y no se deben quitar filas ni columnas de una tabla existente sin ajustar `ref` (mejor reconstruir el libro desde cero).
"""
import html
import re
import shutil
import sys
import zipfile
from xml.sax.saxutils import escape


def arreglar(origen, destino):
    zin = zipfile.ZipFile(origen)
    partes = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    textos, indice = [], {}

    def sst(texto):
        if texto not in indice:
            indice[texto] = len(textos)
            textos.append(texto)
        return indice[texto]

    cuenta = 0
    for n in list(partes):
        if re.match(r'xl/worksheets/sheet\d+\.xml$', n):
            x = partes[n].decode('utf8')

            def cambia(m):
                nonlocal cuenta
                attrs, cuerpo = m.group(1), m.group(2)
                t = re.search(r'<is>(.*?)</is>', cuerpo, re.S)
                partes_t = re.findall(r'<t[^>]*>(.*?)</t>', t.group(1), re.S) if t else []
                texto = ''.join(partes_t)
                texto = html.unescape(texto)   # incluye referencias numéricas (&#225;) que escribe openpyxl
                cuenta += 1
                attrs = re.sub(r'\s+t="inlineStr"', ' t="s"', attrs)
                return f'<c{attrs}><v>{sst(texto)}</v></c>'

            x = re.sub(r'<c((?:\s+[a-z]+="[^"]*")*\s+t="inlineStr"(?:\s+[a-z]+="[^"]*")*)>(.*?)</c>', cambia, x, flags=re.S)
            partes[n] = x.encode('utf8')
    if cuenta and 'xl/sharedStrings.xml' not in partes:
        cuerpo = ''.join(f'<si><t xml:space="preserve">{escape(t)}</t></si>' for t in textos)
        partes['xl/sharedStrings.xml'] = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
                                          f'count="{cuenta}" uniqueCount="{len(textos)}">{cuerpo}</sst>').encode('utf8')
        ct = partes['[Content_Types].xml'].decode('utf8')
        if 'sharedStrings' not in ct:
            ct = ct.replace('</Types>', '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>')
        partes['[Content_Types].xml'] = ct.encode('utf8')
        rel = partes['xl/_rels/workbook.xml.rels'].decode('utf8')
        if 'sharedStrings' not in rel:
            ids = [int(i) for i in re.findall(r'Id="rId(\d+)"', rel)]
            rel = rel.replace('</Relationships>', f'<Relationship Id="rId{max(ids) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>')
            partes['xl/_rels/workbook.xml.rels'] = rel.encode('utf8')
    w = partes['xl/workbook.xml'].decode('utf8').replace('<definedNames/>', '')
    partes['xl/workbook.xml'] = w.encode('utf8')
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as zout:
        orden = ['[Content_Types].xml'] + [n for n in partes if n != '[Content_Types].xml']
        for n in orden:
            zout.writestr(n, partes[n])
    return cuenta


if __name__ == '__main__':
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else src + '.tmp'
    n = arreglar(src, dst)
    if len(sys.argv) <= 2:
        shutil.move(dst, src)
    print(f'{n} celdas de texto pasadas a sharedStrings')
