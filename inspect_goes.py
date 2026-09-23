import pandas as pd
from sunpy.net import Fido, attrs as a
from sunpy import timeseries as ts

def main():
    print("Searching for GOES 15 XRS data for Feb 16, 2011...")
    tstart = "2011-02-16 00:00"
    tend = "2011-02-16 23:59"
    result = Fido.search(a.Time(tstart, tend), a.Instrument("XRS"), a.goes.SatelliteNumber(15))
    
    print("Search Result:")
    print(result)
    
    print("Downloading GOES data...")
    goes_files = Fido.fetch(result)
    
    print(f"Downloaded files: {goes_files}")
    if not goes_files:
        print("No files downloaded.")
        return
        
    print("Loading into TimeSeries...")
    goes_ts = ts.TimeSeries(goes_files)
    df = goes_ts[1].to_dataframe()
    
    print("--- GOES DATA SCHEMA ---")
    df.info()
    
    print("--- SAMPLE DATA ---")
    print(df.head())
    
    # Save a sample to CSV
    output_path = "/home/maaz/solar-flare-project/data/raw/goes_sample.csv"
    df.to_csv(output_path)
    print(f"Saved sample to {output_path}")

if __name__ == "__main__":
    main()
