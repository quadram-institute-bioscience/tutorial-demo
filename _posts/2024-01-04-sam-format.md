---
layout: default
title: "SAM Format"
date: 2024-01-04
---

# SAM Format: Sequence Alignment Map

The SAM (Sequence Alignment Map) format is the standard for storing alignments of sequencing reads to reference genomes. Understanding SAM format is essential for working with modern sequencing data.

## SAM vs BAM

- **SAM**: Human-readable text format
- **BAM**: Binary compressed version of SAM (smaller, faster)
- **CRAM**: Even more compressed format

## SAM File Structure

A SAM file consists of:
1. **Header section** (optional, starts with @)
2. **Alignment section** (one line per read)

### Header Section

```
@HD	VN:1.6	SO:coordinate
@SQ	SN:chr1	LN:248956422
@SQ	SN:chr2	LN:242193529
@RG	ID:sample1	SM:patient_001	PL:ILLUMINA
@PG	ID:bwa	PN:bwa	VN:0.7.17
```

Header line types:
- **@HD**: File format version and sorting order
- **@SQ**: Reference sequence information  
- **@RG**: Read group information
- **@PG**: Program information

## Alignment Section: The 11 Mandatory Fields

Each alignment line has 11 required fields:

| Field | Name | Description | Example |
|-------|------|-------------|---------|
| 1 | QNAME | Query name (read ID) | `READ_001` |
| 2 | FLAG | Bitwise flag | `99` |
| 3 | RNAME | Reference name | `chr1` |
| 4 | POS | 1-based leftmost position | `1000` |
| 5 | MAPQ | Mapping quality | `60` |
| 6 | CIGAR | CIGAR string | `100M` |
| 7 | RNEXT | Reference name of mate | `=` |
| 8 | PNEXT | Position of mate | `1150` |
| 9 | TLEN | Template length | `250` |
| 10 | SEQ | Read sequence | `ATCG...` |
| 11 | QUAL | Base qualities | `IIII...` |

### Example SAM Line

```
READ_001	99	chr1	1000	60	100M	=	1150	250	ATCGATCGATCG...	IIIIIIIIIIII...
```

## Understanding SAM FLAGS

The FLAG field uses bitwise encoding:

| Bit | Value | Description |
|-----|-------|-------------|
| 0x1 | 1 | Template has multiple segments |
| 0x2 | 2 | Each segment properly aligned |
| 0x4 | 4 | Segment unmapped |
| 0x8 | 8 | Next segment unmapped |
| 0x10 | 16 | SEQ reverse complemented |
| 0x20 | 32 | SEQ of next segment reversed |
| 0x40 | 64 | First segment in template |
| 0x80 | 128 | Last segment in template |

### Common FLAG Values

| FLAG | Meaning |
|------|---------|
| 0 | Single read, mapped, forward strand |
| 16 | Single read, mapped, reverse strand |
| 4 | Single read, unmapped |
| 99 | Paired read, first in pair, both mapped, forward |
| 147 | Paired read, second in pair, both mapped, reverse |

<details markdown="1">
  <summary>How to decode FLAG values?</summary>
  
  To decode a FLAG value, convert it to binary and check which bits are set:
  
  Example: FLAG = 99
  - 99 in binary = 1100011
  - Bits set: 1, 2, 32, 64
  - Meaning: Multiple segments (1) + Properly aligned (2) + Next segment reverse (32) + First segment (64)
  
  **Online tools**: Use SAM flag decoder websites or `samtools flags` command

</details>

## CIGAR Strings

CIGAR describes how the read aligns to the reference:

| Code | Description |
|------|-------------|
| M | Match or mismatch |
| I | Insertion in read |
| D | Deletion in read |
| N | Skipped region (intron) |
| S | Soft clipping |
| H | Hard clipping |
| P | Padding |
| = | Exact match |
| X | Mismatch |

### CIGAR Examples

```
100M        # 100 bases match/mismatch
50M2I48M    # 50 match, 2 insertion, 48 match  
30M10D70M   # 30 match, 10 deletion, 70 match
10S90M      # 10 soft-clipped, 90 match
```

## Mapping Quality (MAPQ)

MAPQ indicates confidence in mapping position:

| MAPQ | Probability of Error | Meaning |
|------|---------------------|---------|
| 0 | 100% | Unmapped or ambiguous |
| 10 | 10% | Low confidence |
| 20 | 1% | Moderate confidence |
| 30 | 0.1% | High confidence |
| 60 | 0.0001% | Very high confidence |

## Working with SAM/BAM Files

### Basic samtools Commands

```bash
# View SAM file
samtools view alignment.sam

# Convert SAM to BAM
samtools view -b alignment.sam > alignment.bam

# Sort BAM file
samtools sort alignment.bam -o sorted.bam

# Index BAM file (required for random access)
samtools index sorted.bam

# View specific region
samtools view sorted.bam chr1:1000-2000

# Get alignment statistics
samtools flagstat sorted.bam

# View header only
samtools view -H sorted.bam
```

### SAM/BAM Statistics

```bash
# Basic statistics
samtools flagstat input.bam

# Detailed statistics
samtools stats input.bam

# Coverage depth
samtools depth input.bam

# Coverage histogram
samtools coverage input.bam
```

Sample `flagstat` output:
```
1000000 + 0 in total (QC-passed reads + QC-failed reads)
950000 + 0 primary
0 + 0 secondary
50000 + 0 supplementary
0 + 0 duplicates
980000 + 0 mapped (98.00% : N/A)
1000000 + 0 paired in sequencing
500000 + 0 read1
500000 + 0 read2
940000 + 0 properly paired (94.00% : N/A)
960000 + 0 with itself and mate mapped
20000 + 0 singletons (2.00% : N/A)
```

## Optional Fields (Tags)

SAM files can include optional fields with additional information:

| Tag | Type | Description |
|-----|------|-------------|
| NM | i | Edit distance |
| MD | Z | Mismatch positions |
| AS | i | Alignment score |
| XS | i | Suboptimal score |
| NH | i | Number of hits |
| HI | i | Hit index |

### Example with Optional Fields

```
READ_001	99	chr1	1000	60	100M	=	1150	250	ATCG...	IIII...	NM:i:2	MD:Z:50A25T24	AS:i:190
```

## Best Practices

1. **Always sort and index**: Required for efficient access
2. **Use BAM for storage**: Much smaller than SAM
3. **Validate files**: Use `samtools quickcheck`
4. **Keep headers**: Essential for interpretation
5. **Use standard tags**: Follow SAM specification

<details markdown="1">
  <summary>Common SAM/BAM processing workflow</summary>
  
  ```bash
  # 1. Align reads (using BWA as example)
  bwa mem reference.fasta reads_R1.fastq reads_R2.fastq > alignment.sam
  
  # 2. Convert to BAM and sort
  samtools view -b alignment.sam | samtools sort -o sorted.bam
  
  # 3. Index for random access
  samtools index sorted.bam
  
  # 4. Check quality
  samtools flagstat sorted.bam
  samtools stats sorted.bam
  
  # 5. Remove PCR duplicates (optional)
  samtools rmdup sorted.bam dedup.bam
  
  # 6. Filter by quality (optional)
  samtools view -q 30 -b sorted.bam > filtered.bam
  ```

</details>

---

Now that you understand how alignments are stored, let's explore how to evaluate the quality of different alignment tools and mappers.