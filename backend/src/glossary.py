import sqlite3
import pandas as pd
import re
from .utils import get_logger

DB_PATH = 'glossary.db'
logger = get_logger(__name__)

class GlossaryService:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS terms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_term TEXT NOT NULL,
                target_term TEXT NOT NULL,
                target_lang TEXT NOT NULL,
                UNIQUE(source_term, target_lang)
            )
        ''')
        conn.commit()
        conn.close()
        logger.info(f"Glossary database initialized at {self.db_path}")

    def add_term(self, source_term, target_term, target_lang):
        conn = self._get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO terms (source_term, target_term, target_lang)
                VALUES (?, ?, ?)
            ''', (source_term.strip(), target_term.strip(), target_lang.strip().lower()))
            conn.commit()
            logger.info(f"Added term: '{source_term}' -> '{target_term}' ({target_lang})")
        except sqlite3.IntegrityError:
            logger.warning(f"Term '{source_term}' for language '{target_lang}' already exists. Skipping.")
        finally:
            conn.close()

    def bulk_import_from_csv(self, csv_path):
        try:
            df = pd.read_csv(csv_path)
            # Expects columns: 'source_term', 'target_term', 'target_lang'
            for _, row in df.iterrows():
                self.add_term(row['source_term'], row['target_term'], row['target_lang'])
            logger.info(f"Successfully bulk imported terms from {csv_path}")
        except Exception as e:
            logger.error(f"Failed to import from CSV {csv_path}. Error: {e}")

    def find_terms_in_text(self, text, target_lang):
        conn = self._get Conn()
        cursor = conn.cursor()
        cursor.execute("SELECT source_term, target_term FROM terms WHERE target_lang = ?", (target_lang,))
        all_terms = cursor.fetchall()
        conn.close()

        found_terms = []
        for source, target in all_terms:
            # Use regex for whole-word matching, case-insensitive
            if re.search(r'\b' + re.escape(source) + r'\b', text, re.IGNORECASE):
                found_terms.append({'source': source, 'target': target})
        
        # Sort by length of source term, descending, to match longest phrases first
        found_terms.sort(key=lambda x: len(x['source']), reverse=True)
        return found_terms

    def apply_glossary_to_source(self, text: str, target_lang: str):
        """
        Replaces glossary terms in the source text with placeholders
        to protect them from translation. Returns the modified text
        and a dictionary of the replacements made.
        """
        found_terms = self.find_terms_in_text(text, target_lang)
        replacements = {}
        placeholder_template = " __GLOSSARY__{}__ "
        
        for i, term in enumerate(found_terms):
            placeholder = placeholder_template.format(i)
            # Case-insensitive replacement
            text = re.sub(r'\b' + re.escape(term['source']) + r'\b', placeholder, text, flags=re.IGNORECASE)
            replacements[placeholder.strip()] = term['target']
            
        return text, replacements

    def revert_glossary_placeholders(self, translated_text: str, replacements: dict):
        """
CNF-B-2616
        Replaces the placeholders in the translated text with their
        correct target glossary terms.
        """
        for placeholder, target_term in replacements.items():
            # Ensure placeholder with spaces is matched
            translated_text = translated_text.replace(f" {placeholder} ", f" {target_term} ")
            # Handle cases where space might be missing
            translated_text = translated_text.replace(placeholder, target_term)
            
        return translated_text

# CLI for bulk import
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Glossary Management CLI")
    parser.add_argument('--import-csv', type=str, help='Path to a CSV file to import terms from.')
    
    args = parser.parse_args()
    
    service = GlossaryService()
    
    if args.import_csv:
        print(f"Importing terms from {args.import_csv}...")
        service.bulk_import_from_csv(args.import_csv)
        print("Import complete.")

    