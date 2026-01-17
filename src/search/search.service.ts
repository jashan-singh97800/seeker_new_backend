import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
    private readonly index = 'jobs';

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async indexJob(job: any) {
        try {
            return await this.elasticsearchService.index({
                index: this.index,
                document: {
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    location: job.location,
                    type: job.type,
                    salary_range: job.salary_range,
                    company_name: job.company?.name,
                    created_at: job.createdAt,
                },
            });
        } catch (error) {
            console.error('Elasticsearch indexJob failed:', error.message);
            throw new InternalServerErrorException('Error indexing job for search');
        }
    }

    async searchJobs(query: string) {
        try {
            const result = await this.elasticsearchService.search({
                index: this.index,
                query: {
                    multi_match: {
                        query,
                        fields: ['title', 'description', 'company_name', 'location'],
                    },
                },
            });

            return result.hits.hits.map((item) => item._source);
        } catch (error) {
            console.error('Elasticsearch searchJobs failed:', error.message);
            // Search is often seen as non-critical, but if the user wants it handled "in all",
            // we should probably throw or return a status. 
            // Given the requirement, I'll throw.
            throw new InternalServerErrorException('Error performing job search');
        }
    }

    async updateJob(job: any) {
        try {
            return await this.elasticsearchService.updateByQuery({
                index: this.index,
                query: {
                    match: {
                        id: job.id,
                    },
                },
                script: {
                    source: `ctx._source.title = params.title; ctx._source.description = params.description; ctx._source.location = params.location; ctx._source.salary_range = params.salary_range; ctx._source.type = params.type;`,
                    params: {
                        title: job.title,
                        description: job.description,
                        location: job.location,
                        salary_range: job.salary_range,
                        type: job.type,
                    }
                },
            });
        } catch (error) {
            console.error('Elasticsearch updateJob failed:', error.message);
            throw new InternalServerErrorException('Error updating job in search index');
        }
    }

    async removeJob(jobId: string) {
        try {
            return await this.elasticsearchService.deleteByQuery({
                index: this.index,
                query: {
                    match: {
                        id: jobId,
                    },
                },
            });
        } catch (error) {
            console.error('Elasticsearch removeJob failed:', error.message);
            throw new InternalServerErrorException('Error removing job from search index');
        }
    }

    async getRecommendations(userId: string) {
        try {
            const result = await this.elasticsearchService.search({
                index: this.index,
                query: {
                    match_all: {},
                },
                size: 5,
                sort: [{ created_at: { order: 'desc' } }],
            });

            return result.hits.hits.map((item) => item._source);
        } catch (error) {
            console.error('Elasticsearch getRecommendations failed:', error.message);
            throw new InternalServerErrorException('Error fetching job recommendations');
        }
    }
}
