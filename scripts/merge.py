import requests
import json
from tqdm import tqdm
import time
import itertools

def read_file(fn=""):
    f = open(fn)
    return json.load(f)

def write_file(fn, data):
    json_object = json.dumps(data, indent=4)
    with open(fn, "w") as outfile:
        outfile.write(json_object)

def merge_files(fl, output_filename):
    final_data = []
    for i in fl:
        final_data += read_file(i)
    write_file(output_filename, final_data)


merge_files(['ip_data.json', 'ip_data_2.json', 'ip_data_3.json'], "final_ip_data.json")
