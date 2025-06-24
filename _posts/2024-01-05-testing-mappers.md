---
layout: default
title: "Testing Mappers"
date: 2024-01-05
---

# Testing and Evaluating Alignment Mappers

Not all alignment tools are created equal. Understanding how to evaluate and compare mappers is crucial for choosing the right tool for your analysis and ensuring reliable results.

## Why Test Mappers?

Different alignment tools excel in different scenarios:
- **Short reads vs long reads**
- **DNA vs RNA sequencing**  
- **Sensitivity vs speed trade-offs**
- **Handling of variants and structural changes**

## Key Performance Metrics

### 1. Accuracy Metrics

| Metric | Formula | Meaning |
|--------|---------|---------|
| **Sensitivity** | TP/(TP+FN) | Fraction of true alignments found |
| **Precision** | TP/(TP+FP) | Fraction of reported alignments that are correct |
| **F1-Score** | 2×(Precision×Sensitivity)/(Precision+Sensitivity) | Harmonic mean of precision and sensitivity |

Where:
- **TP**: True Positives (correct alignments)
- **FP**: False Positives (incorrect alignments)  
- **FN**: False Negatives (missed alignments)

### 2. Speed Metrics

```bash
# Measure runtime and memory usage
/usr/bin/time -v mapper_command input.fastq > output.sam

# Key metrics from time output:
# - Elapsed (wall clock) time
# - User time (CPU time)  
# - Maximum resident set size (peak memory)
```

### 3. Alignment Quality Metrics

| Metric | Good Value | Description |
|--------|------------|-------------|
| **Mapping Rate** | > 90% | Percentage of reads that align |
| **Properly Paired** | > 95% | Paired reads with expected orientation/distance |
| **Mean MAPQ** | > 20 | Average mapping quality score |
| **Duplicate Rate** | < 10% | Percentage of PCR/optical duplicates |

## Creating Test Datasets

### 1. Simulated Data

Use read simulators to create datasets with known truth:

```bash
# Using ART (Illumina read simulator)
art_illumina \
  -ss HS25 \
  -i reference.fasta \
  -l 150 \
  -f 20 \
  -o simulated_reads

# Using DWGSIM
dwgsim \
  -N 1000000 \
  -1 150 \
  -2 150 \
  reference.fasta \
  simulated
```

### 2. Spike-in Controls

Add known sequences to your sample:
- **ERCC spike-ins**: External RNA Controls Consortium standards
- **Synthetic DNA constructs**: Custom designed sequences
- **PhiX**: Illumina control library

## Benchmark Datasets

### Standard Benchmarks

| Dataset | Type | Description |
|---------|------|-------------|
| **NA12878** | Human WGS | Well-characterized human genome |
| **HG002** | Human WGS | GIAB high-confidence calls |
| **SEQC** | RNA-seq | Reference RNA samples |
| **MAQC** | Microarray/RNA-seq | Cross-platform validation |

### Long-read Benchmarks

```bash
# PacBio data
wget ftp://ftp-trace.ncbi.nlm.nih.gov/giab/ftp/data/NA12878/PacBio_MtSinai/

# Oxford Nanopore data  
wget ftp://ftp-trace.ncbi.nlm.nih.gov/giab/ftp/data/NA12878/NA12878_PacBio_MtSinai/
```

## Testing Framework Example

### 1. Set Up Test Environment

```bash
#!/bin/bash
# test_mapper.sh

REFERENCE="reference.fasta"
READS_R1="test_R1.fastq"
READS_R2="test_R2.fastq"
TRUTH_BAM="truth.bam"  # Known correct alignments

# Mappers to test
MAPPERS=("bwa" "bowtie2" "minimap2" "hisat2")
```

### 2. Run Alignments

```bash
# BWA-MEM
bwa mem -t 8 $REFERENCE $READS_R1 $READS_R2 | samtools sort -o bwa.bam
samtools index bwa.bam

# Bowtie2
bowtie2 -x reference_index -1 $READS_R1 -2 $READS_R2 | samtools sort -o bowtie2.bam
samtools index bowtie2.bam

# Minimap2
minimap2 -ax sr $REFERENCE $READS_R1 $READS_R2 | samtools sort -o minimap2.bam
samtools index minimap2.bam
```

### 3. Collect Statistics

```bash
for mapper in "${MAPPERS[@]}"; do
    echo "=== $mapper ==="
    
    # Basic stats
    samtools flagstat ${mapper}.bam
    
    # Mapping quality distribution
    samtools view ${mapper}.bam | cut -f5 | sort -n | uniq -c > ${mapper}_mapq.txt
    
    # Insert size distribution (for paired reads)
    samtools view -f 2 ${mapper}.bam | cut -f9 | sort -n > ${mapper}_insert.txt
done
```

## Advanced Evaluation Tools

### 1. Teaser

Evaluate alignment accuracy using simulation truth:

```bash
# Install teaser
pip install teaser

# Run evaluation
teaser -r reference.fasta -t truth.sam -a test.sam -o results/
```

### 2. Rabema

Read alignment benchmark for evaluating mappers:

```bash
# Build gold standard
rabema_build_gold_standard -r reference.fasta -s simulated.sam -o gold.gsi

# Evaluate mapper
rabema_evaluate -g gold.gsi -a test.sam -o evaluation.txt
```

### 3. Mason

Sophisticated read simulator with variant support:

```bash
# Simulate with variants
mason_simulator \
  -ir reference.fasta \
  -n 1000000 \
  -o simulated \
  --illumina-read-length 150 \
  --fragment-mean-size 300
```

## Evaluation Checklist

<details markdown="1">
  <summary>Comprehensive mapper evaluation checklist</summary>
  
  **Accuracy Assessment:**
  - [ ] Test on simulated data with known truth
  - [ ] Measure sensitivity and precision
  - [ ] Evaluate on different read lengths
  - [ ] Test with various error rates
  - [ ] Assess handling of variants/indels
  
  **Performance Assessment:**
  - [ ] Measure wall-clock time
  - [ ] Monitor memory usage
  - [ ] Test scalability with different data sizes
  - [ ] Evaluate multi-threading efficiency
  
  **Robustness Testing:**
  - [ ] Test with poor quality reads
  - [ ] Evaluate with contaminated samples
  - [ ] Test with repetitive sequences
  - [ ] Assess handling of edge cases
  
  **Practical Considerations:**
  - [ ] Installation and setup difficulty
  - [ ] Documentation quality
  - [ ] Output format compatibility
  - [ ] Parameter sensitivity analysis

</details>

## Common Pitfalls

### 1. Overfitting to Benchmarks
- Don't optimize only for standard benchmarks
- Test on your actual data types
- Consider your specific use case

### 2. Ignoring Parameter Tuning
```bash
# Don't just use defaults - optimize for your data
bwa mem -k 19 -w 100 -d 100 -r 1.5 -A 1 -B 4 -O 6 -E 1 -L 5 reference.fasta reads.fastq
```

### 3. Not Considering Downstream Analysis
- Consider how alignment affects variant calling
- Evaluate impact on gene expression quantification
- Test compatibility with analysis pipelines

## Reporting Results

### Performance Summary Table

| Mapper | Mapping Rate | Properly Paired | Mean MAPQ | Runtime (min) | Memory (GB) |
|--------|--------------|-----------------|-----------|---------------|-------------|
| BWA-MEM | 94.2% | 91.8% | 35.2 | 45 | 8.2 |
| Bowtie2 | 93.8% | 90.5% | 32.1 | 52 | 3.1 |
| Minimap2 | 95.1% | 92.3% | 38.7 | 18 | 12.5 |

### Visualization

```python
import matplotlib.pyplot as plt
import pandas as pd

# Create performance comparison plots
df = pd.read_csv('mapper_results.csv')

# Speed vs accuracy plot
plt.scatter(df['runtime'], df['accuracy'])
plt.xlabel('Runtime (minutes)')
plt.ylabel('Accuracy (%)')
plt.title('Mapper Performance Comparison')

# Memory usage comparison
plt.bar(df['mapper'], df['memory_gb'])
plt.ylabel('Memory Usage (GB)')
plt.title('Memory Requirements by Mapper')
```

---

Understanding mapper performance helps you choose the right tool for your specific needs. Next, we'll explore Minimap2, a versatile modern aligner that excels with long reads and various data types.