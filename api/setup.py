from setuptools import setup, find_packages

setup(
    name='tactil_api',
    version='1.0',
    packages=find_packages(),
    entry_points = {
        'console_scripts': ['process_pcd=tactil_api.process_cloud:main'],
    }
)