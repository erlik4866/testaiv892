import pandas as pd
import matplotlib.pyplot as plt
import io
import base64

def analyze_data(file_content, file_type):
    try:
        if file_type == 'csv':
            df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
        elif file_type == 'json':
            df = pd.read_json(io.StringIO(file_content.decode('utf-8')))
        else:
            return {'error': 'Unsupported file type'}

        # Basic analysis
        analysis = {
            'shape': df.shape,
            'columns': list(df.columns),
            'dtypes': df.dtypes.to_dict(),
            'describe': df.describe().to_dict(),
            'null_counts': df.isnull().sum().to_dict()
        }

        # Generate plot if possible
        if len(df.select_dtypes(include=[float, int]).columns) > 0:
            plt.figure(figsize=(10, 6))
            df.select_dtypes(include=[float, int]).hist()
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            plot_data = base64.b64encode(buf.read()).decode('utf-8')
            analysis['plot'] = plot_data
            plt.close()

        return analysis
    except Exception as e:
        return {'error': str(e)}
